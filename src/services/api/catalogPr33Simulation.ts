import { ApiError } from './errors';
import { productResponse } from './catalogContracts';
import type { CreateProductRequest, ProductResponse } from '@/types/api';
import { Pr33MediaSimulation, type Pr33SimulationTransport } from './mediaPr33Simulation';

export interface SimulatedProduct extends ProductResponse { imageUrl: string | null; imageUrlExpiresAt: string | null }
function decode(value: unknown): SimulatedProduct {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('invalid_response', 'Producto PR33 inválido.');
  const v = value as Record<string, unknown>;
  const { imageUrl: fixtureUrl, imageUrlExpiresAt: fixtureExpiry, ...commercial } = v;
  const product = productResponse(commercial);
  void fixtureUrl; void fixtureExpiry;
  if (v.imageUrl === null && v.imageUrlExpiresAt === null) return { ...product, imageUrl: null, imageUrlExpiresAt: null };
  if (typeof v.imageUrl !== 'string' || typeof v.imageUrlExpiresAt !== 'string' || !Number.isFinite(Date.parse(v.imageUrlExpiresAt))) throw new ApiError('invalid_response', 'Imagen PR33 inválida.');
  try {
    const url = new URL(v.imageUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'images.example.test' || url.username || url.password || url.port || url.hash) throw new Error('invalid');
  } catch { throw new ApiError('invalid_response', 'Imagen PR33 inválida.'); }
  return { ...product, imageUrl: v.imageUrl, imageUrlExpiresAt: v.imageUrlExpiresAt };
}
/** Isolated fixture-only catalog. It never uses httpClient or the production session. */
export class Pr33CatalogSimulation {
  private busy = false;
  private attempted = false;
  private readonly refreshed = new Set<string>();
  constructor(private readonly transport: Pr33SimulationTransport) {
    if (!__DEV__) throw new ApiError('configuration', 'Simulación no disponible.');
  }
  async create(input: CreateProductRequest, media?: Pr33MediaSimulation): Promise<SimulatedProduct> {
    if (this.busy || this.attempted) throw new ApiError('validation', 'Ya existe un envío en curso, confirmado o incierto.');
    const mediaAssetId = media?.approvedAssetId();
    if (media && !mediaAssetId) throw new ApiError('validation', 'La fotografía aún no está aprobada.');
    this.busy = true;
    try {
      const body = { name: input.name, description: input.description, ingredients: input.ingredients, categoryId: input.categoryId,
        price: input.price, stock: input.stock, ...(mediaAssetId ? { mediaAssetId } : {}) };
      this.attempted = true;
      return decode(await this.transport.request('/api/v1/products', 'POST', body));
    } finally { this.busy = false; }
  }
  async patchImage(productId: string, image: Pr33MediaSimulation | null): Promise<SimulatedProduct> {
    if (this.busy || !/^[a-f\d]{24}$/i.test(productId)) throw new ApiError('validation', 'Producto inválido u operación en curso.');
    const mediaAssetId = image === null ? null : image.approvedAssetId();
    if (mediaAssetId === undefined) throw new ApiError('validation', 'La fotografía aún no está aprobada.');
    this.busy = true;
    try { return decode(await this.transport.request(`/api/v1/products/${productId}`, 'PATCH', { mediaAssetId })); }
    finally { this.busy = false; }
  }
  /** Refresh at most once per product per simulation; failure returns an honest placeholder. */
  async refreshExpired(product: SimulatedProduct, now = Date.now()): Promise<SimulatedProduct> {
    if (!product.imageUrl || !product.imageUrlExpiresAt || Date.parse(product.imageUrlExpiresAt) > now) return product;
    const placeholder = { ...product, imageUrl: null, imageUrlExpiresAt: null };
    if (this.busy || this.refreshed.has(product.id) || !/^[a-f\d]{24}$/i.test(product.id)) return placeholder;
    this.refreshed.add(product.id); this.busy = true;
    try {
      const updated = decode(await this.transport.request(`/api/v1/products/${product.id}`, 'GET'));
      if (updated.id !== product.id || (updated.imageUrlExpiresAt && Date.parse(updated.imageUrlExpiresAt) <= now)) return placeholder;
      return updated;
    } catch { return placeholder; }
    finally { this.busy = false; }
  }
}
