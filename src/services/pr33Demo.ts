import { Pr33MediaSimulation, type Pr33SimulationTransport, type Pr33MediaStatus } from './api/mediaPr33Simulation';
import { Pr33CatalogSimulation, type SimulatedProduct } from './api/catalogPr33Simulation';
import type { CreateProductRequest, ProductPatch } from '@/types/api';
import type { LocalProductPhoto } from './productPhoto';
import { usesProductMediaDemo } from '@/config/productMedia';
import { ApiError } from './api/errors';
import { productResponse } from './api/catalogContracts';

/** Memory transport for existing PR33 simulators. No fetch, no JWT, no AWS session. */
const categoryId = '507f1f77bcf86cd799439031';
export const demoCategories = [{ id: categoryId, name: 'Categoría de demostración', sortOrder: 1 }];
let sequence = 100;
let products: SimulatedProduct[] = [];
let revision = 0;
const listeners = new Set<() => void>();
const assets = new Map<string, { status: Pr33MediaStatus; result: Pr33MediaStatus; photo: LocalProductPhoto }>();
const photos = new Map<string, string>();
const mediaForProduct = new Map<string, string>();
function assertDemo() { if (!usesProductMediaDemo()) throw new ApiError('configuration', 'La demostración PR33 no está habilitada.'); }
function emit() { revision++; listeners.forEach((callback) => callback()); }
const id = () => (++sequence).toString(16).padStart(24, '0');
const image = (asset?: string) => asset ? { imageUrl: `https://images.example.test/${asset}?revision=${revision}`, imageUrlExpiresAt: new Date(Date.now() + 300000).toISOString() } : { imageUrl: null, imageUrlExpiresAt: null };
function product(productId: string) { const found = products.find((item) => item.id === productId); if (!found) throw new ApiError('http', 'Producto de demostración no encontrado.', 404); return found; }
export const pr33Demo = {
  reset() { assertDemo(); products = []; assets.clear(); photos.clear(); mediaForProduct.clear(); emit(); },
  subscribe(callback: () => void) { listeners.add(callback); return () => { listeners.delete(callback); }; },
  snapshot() { return revision; },
  list() { assertDemo(); return [...products]; },
  uri(productId: string) { assertDemo(); return photos.get(productId); },
  async photo(photo: LocalProductPhoto, result: Pr33MediaStatus) {
    assertDemo();
    let intent: string | undefined;
    const transport: Pr33SimulationTransport = {
      async request(path, method) {
        assertDemo();
        if (method === 'POST' && path === '/api/v1/media/upload-url') {
          intent = id(); assets.set(intent, { photo, status: 'PendingUpload', result });
          return { mediaAssetId: intent, uploadUrl: `https://upload.example.test/${intent}`, expiresAt: new Date(Date.now() + 300000).toISOString(), headers: { 'Content-Type': photo.mimeType } };
        }
        if (!intent) throw new ApiError('validation', 'Sin intención de demostración.');
        const asset = assets.get(intent);
        if (!asset) throw new ApiError('http', 'Asset de demostración no encontrado.', 404);
        if (path === '/api/v1/media/confirm') { if (asset.status === 'PendingUpload') asset.status = 'PendingModeration'; return { mediaAssetId: intent, status: asset.status }; }
        if (method === 'GET' && path === `/api/v1/media/${intent}`) {
          asset.status = asset.result;
          return { mediaAssetId: intent, status: asset.status, ...image(asset.status === 'Approved' ? intent : undefined) };
        }
        throw new ApiError('validation', 'Ruta no soportada en demostración.');
      },
      async put() { assertDemo(); /* Bytes already validated by the shared simulator; no network. */ },
    };
    const flow = new Pr33MediaSimulation(transport, 'upload.example.test', 'images.example.test');
    await flow.upload(photo); return flow;
  },
  catalog() {
    assertDemo();
    const transport: Pr33SimulationTransport = {
      async put() { throw new ApiError('validation', 'Catalog no realiza PUT.'); },
      async request(path, method, body) {
        assertDemo();
        const assetId = body?.mediaAssetId;
        const asset = typeof assetId === 'string' ? assets.get(assetId) : undefined;
        if (typeof assetId === 'string' && asset?.status !== 'Approved') throw new ApiError('http', 'La fotografía de demostración no está aprobada.', 422);
        if (method === 'POST' && path === '/api/v1/products' && body) {
          const date = new Date().toISOString();
          const value = { ...body, id: id(), sellerId: 'demo-seller', sellerDisplayName: 'Negocio de demostración', categoryName: demoCategories[0].name,
            status: 'Active', isAvailable: true, ratingAverage: null, ratingCount: null, createdAt: date, updatedAt: date, ...image(typeof assetId === 'string' ? assetId : undefined) };
          // The shared catalog simulator validates this complete wire response.
          const { imageUrl: fixtureUrl, imageUrlExpiresAt: fixtureExpiry, ...commercial } = value;
          const parsed = productResponse(commercial);
          void fixtureUrl; void fixtureExpiry;
          const item: SimulatedProduct = { ...parsed, ...image(typeof assetId === 'string' ? assetId : undefined) };
          products = [...products, item];
          if (asset && typeof assetId === 'string') { photos.set(item.id, asset.photo.uri); mediaForProduct.set(item.id, assetId); }
          emit(); return item;
        }
        const productId = path.split('/').pop() ?? '';
        const item = product(productId);
        if (method === 'PATCH') {
          if (assetId === null) { photos.delete(productId); mediaForProduct.delete(productId); }
          else if (asset && typeof assetId === 'string') { photos.set(productId, asset.photo.uri); mediaForProduct.set(productId, assetId); }
          const updated = { ...item, ...image(mediaForProduct.get(productId)) };
          products = products.map((p) => p.id === productId ? updated : p); emit(); return updated;
        }
        return { ...item, ...image(mediaForProduct.get(productId)) };
      },
    };
    return new Pr33CatalogSimulation(transport);
  },
  async create(input: CreateProductRequest, flow?: Pr33MediaSimulation, catalog?: Pr33CatalogSimulation): Promise<SimulatedProduct> { return (catalog ?? pr33Demo.catalog()).create(input, flow); },
  async consult(productId: string, patch?: ProductPatch) {
    assertDemo(); const item = product(productId);
    if (patch) { const updated = { ...item, ...patch }; products = products.map((p) => p.id === productId ? updated : p); emit(); return updated; }
    return item;
  },
  async availability(productId: string, status: 'Active' | 'Paused') {
    assertDemo(); const item = { ...product(productId), status, isAvailable: status === 'Active' && product(productId).stock > 0 };
    products = products.map((p) => p.id === productId ? item : p); emit(); return item;
  },
  expire(productId: string) {
    assertDemo(); const item = product(productId);
    if (!item.imageUrl) return;
    products = products.map((p) => p.id === productId ? { ...p, imageUrlExpiresAt: '2000-01-01T00:00:00Z' } : p); emit();
  },
  async renew(productId: string): Promise<SimulatedProduct> {
    assertDemo(); const item = product(productId);
    const updated = await pr33Demo.catalog().refreshExpired(item);
    products = products.map((p) => p.id === productId ? updated : p); emit(); return updated;
  },
};
