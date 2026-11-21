import type { User } from '@/types/models';
import type { SellerActivationRequest, SellerActiveResponse, UserPatch, CreateProductRequest, ProductResponse, ProductPatch, CreateOrderRequest, ProductAvailabilityRequest } from '@/types/api';
import { institutionalEmail, requirePassword } from '@/utils/apiValidation';

import { authService } from './api/authService';
import { ApiError } from './api/errors';
import { httpClient } from './api/httpClient';
import { registrationDiagnostic } from './api/registrationDiagnostics';
import { requireProfileContract, requireSessionContract, sessionContract, type SessionContract } from './api/sessionContract';
import { userService } from './api/userService';
import { sessionStorage, type SessionStorage } from './sessionStorage';
import { pendingRegistration } from './pendingRegistration';
import { sellerService } from './api/sellerService';
import { activationBody } from '@/utils/sellerValidation';
import { createProductBody, productPatchBody, productAvailabilityBody, productService } from './api/productService';
import { categoryService } from './api/categoryService';
import { createOrderBody, orderService } from './api/orderService';

interface AuthSessionDependencies {
  storage: SessionStorage;
  auth: typeof authService;
  users: typeof userService;
  contract: SessionContract | null;
  assertSecureTransport: () => void;
}
export type SellerSessionResult = { kind: 'missing'; status: 404; roleSynced: false; seller?: never; user?: never } |
  { kind: 'active'; status: number; seller: SellerActiveResponse; roleSynced: boolean; user?: User; reconciled?: true };
export interface SellerSubmissionState { received: boolean; uncertain: boolean }

/** Coordinador del único AuthContext. No mantiene una segunda copia de User ni sesión demo. */
export class AuthSession {
  private generation = 0;
  private token: string | null = null;
  private profileRevision = 0;
  private sellerBusy = false;
  private sellerSubmitted = false;
  private sellerOutcomeUnknown = false;
  private sellerLookup?: { generation: number; promise: Promise<SellerSessionResult> };
  private commerceBusy = false;
  private readonly submitted = new Set<string>();
  private readonly uncertain = new Set<string>();
  private readonly productOwners = new Map<string, string>();

  constructor(private readonly deps: AuthSessionDependencies) {}

  private checkCurrent(generation: number, profileRevision?: number): void {
    if (generation !== this.generation || (profileRevision !== undefined && profileRevision !== this.profileRevision)) {
      throw new ApiError('cancelled', 'La operación de sesión fue cancelada.');
    }
  }

  /** Provider/Refresh teardown invalidates this coordinator's work without deleting the persisted JWT. */
  cancelPendingOperations(): void {
    ++this.generation;
    this.token = null;
  }

  private async validatedUser(token: string, contract: SessionContract, generation: number, expected?: User, profileRevision?: number): Promise<User> {
    const profileContract = requireProfileContract(contract);
    const authResponse = await this.deps.auth.getMe(token);
    this.checkCurrent(generation, profileRevision);
    const identity = profileContract.decodeIdentity(authResponse.data);
    if (expected && (expected.id !== identity.id || expected.email !== identity.email || expected.role !== identity.role)) {
      throw new ApiError('invalid_response', 'La identidad autenticada no coincide con la respuesta de login.');
    }
    const profileResponse = await this.deps.users.getMe(token);
    this.checkCurrent(generation, profileRevision);
    return profileContract.decodeProfile(profileResponse.data, identity);
  }

  async restore(): Promise<User | null> {
    const generation = ++this.generation;
    this.sellerSubmitted = false; this.sellerOutcomeUnknown = false;
    // Restoring the same coordinator is not evidence that an uncertain POST failed.
    this.productOwners.clear();
    this.token = null;
    const token = await this.deps.storage.read();
    this.checkCurrent(generation);
    if (!token) return null;
    this.deps.assertSecureTransport();
    const contract = requireSessionContract(this.deps.contract);
    try {
      const user = await this.validatedUser(token, contract, generation);
      this.checkCurrent(generation);
      this.token = token;
      return user;
    } catch (error) {
      this.checkCurrent(generation);
      // Timeout, 403 y errores de servidor no equivalen a token revocado.
      if (error instanceof ApiError && error.status === 401) await this.deps.storage.clear();
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const generation = ++this.generation;
    this.sellerSubmitted = false; this.sellerOutcomeUnknown = false;
    this.submitted.clear(); this.uncertain.clear();
    this.productOwners.clear();
    this.token = null;
    const normalized = institutionalEmail(email);
    const validatedPassword = requirePassword(password);
    this.deps.assertSecureTransport();
    // No enviar un login que todavía no sabemos interpretar de forma segura.
    const contract = requireSessionContract(this.deps.contract);
    const response = await this.deps.auth.login({ email: normalized, password: validatedPassword });
    const token = contract.decodeLogin(response.data);
    this.checkCurrent(generation);
    const expected = contract.decodeLoginUser?.(response.data, normalized);
    const user = await this.validatedUser(token, contract, generation, expected);
    this.checkCurrent(generation);
    await this.deps.storage.save(token);
    this.checkCurrent(generation);
    this.token = token;
    return user;
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    try {
      this.deps.assertSecureTransport();
      await this.deps.auth.register({ displayName, email: institutionalEmail(email), password: requirePassword(password) });
      pendingRegistration.begin(email);
      // Neither200 nor202 proves MongoDB persistence, email verification or a session.
      // No token, setUser, local OTP or assumed Supabase flow.
    } catch (error) {
      registrationDiagnostic({ event: 'failure', kind: error instanceof ApiError ? error.kind : 'unexpected' });
      throw error;
    }
  }

  async refreshProfile(patch?: UserPatch): Promise<User> {
    this.deps.assertSecureTransport();
    const contract = requireSessionContract(this.deps.contract);
    if (!this.token) throw new ApiError('unauthenticated', 'Inicia sesión para consultar tu perfil.');
    requireProfileContract(contract);
    const generation = this.generation;
    const profileRevision = ++this.profileRevision;
    const token = this.token;
    try {
      if (patch) {
        await this.deps.users.updateMe(token, patch);
        this.checkCurrent(generation, profileRevision);
      }
      return await this.validatedUser(token, contract, generation, undefined, profileRevision);
    } catch (error) {
      this.checkCurrent(generation, profileRevision);
      if (error instanceof ApiError && error.status === 401) {
        this.token = null;
        await this.deps.storage.clear();
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    ++this.generation;
    this.token = null;
    this.sellerSubmitted = false;
    this.sellerOutcomeUnknown = false;
    this.submitted.clear();
    this.uncertain.clear();
    this.productOwners.clear();
    pendingRegistration.reset();
    await this.deps.storage.clear();
  }

  /** Private commerce shares the AWS session; no JWT is returned to React. */
  private async commerce<T>(scope: 'product' | 'order', operation: (token: string, user: User, check: () => void, dispatch: () => void) => Promise<T>, postKey?: string): Promise<T> {
    this.deps.assertSecureTransport();
    if (!this.token) throw new ApiError('unauthenticated', 'Inicia sesión para continuar.');
    if (this.commerceBusy) throw new ApiError('validation', 'Ya hay una operación comercial en curso.');
    if (postKey && this.uncertain.has(scope)) {
      const error = new ApiError('validation', 'El resultado de un envío anterior no se pudo confirmar. Consulta tus pedidos o verifica con backend antes de repetir.');
      error.code = scope === 'order' ? 'ORDER_OUTCOME_UNCERTAIN' : 'PRODUCT_OUTCOME_UNCERTAIN';
      throw error;
    }
    if (postKey && this.submitted.has(postKey)) {
      const error = new ApiError('validation', 'Este intento ya fue confirmado. No se enviará nuevamente.');
      error.code = scope === 'order' ? 'ORDER_ALREADY_CONFIRMED' : 'PRODUCT_ALREADY_CONFIRMED';
      throw error;
    }
    const generation = this.generation;
    const token = this.token;
    const check = () => this.checkCurrent(generation);
    let dispatched = false;
    this.commerceBusy = true;
    try {
      const user = await this.validatedUser(token, requireSessionContract(this.deps.contract), generation);
      check();
      const result = await operation(token, user, check, () => { check(); dispatched = true; });
      check();
      if (postKey) this.submitted.add(postKey);
      return result;
    } catch (error) {
      check();
      if (postKey && dispatched && (!(error instanceof ApiError) || ['network', 'timeout', 'invalid_response'].includes(error.kind) || (error.status ?? 0) >= 500)) {
        this.uncertain.add(scope);
        if (scope === 'order') {
          const uncertainError = new ApiError('invalid_response', 'No se pudo confirmar si AWS creó el pedido. Consulta Mis pedidos y verifica antes de intentar nuevamente.');
          uncertainError.code = 'ORDER_OUTCOME_UNCERTAIN';
          throw uncertainError;
        }
      }
      if (error instanceof ApiError && error.status === 401) { this.token = null; await this.deps.storage.clear(); }
      throw error;
    } finally { this.commerceBusy = false; }
  }

  private async activeSeller(token: string, user: User, check: () => void): Promise<SellerActiveResponse> {
    if (user.role !== 'seller') throw new ApiError('http', 'Tu sesión AWS aún no tiene el rol Seller. Vuelve a iniciar sesión.', 403);
    const response = await sellerService.getMe(token);
    check();
    return response.data;
  }

  async createProduct(input: CreateProductRequest) {
    // Validate before taking the mutation path; actual category membership comes from AWS.
    const body = createProductBody(input, [input.categoryId]);
    return this.commerce('product', async (token, user, check, dispatch) => {
      const seller = await this.activeSeller(token, user, check);
      const categories = await categoryService.getAll(); check();
      createProductBody(body, categories.map((item) => item.id));
      dispatch();
      const product = await productService.create(token, body, categories.map((item) => item.id)); check();
      if (product.sellerId !== seller.sellerId) throw new ApiError('invalid_response', 'El producto devuelto no pertenece al negocio autenticado.');
      this.productOwners.set(product.id, product.sellerId);
      return product;
    }, `product:${JSON.stringify(body)}`);
  }

  async ownProduct(id: string, patch?: ProductPatch) {
    const body = patch ? productPatchBody(patch) : undefined;
    return this.commerce('product', async (token, user, check, dispatch) => {
      const seller = await this.activeSeller(token, user, check);
      const product = await productService.getById(id); check();
      if (product.sellerId !== seller.sellerId) throw new ApiError('http', 'Este producto no pertenece a tu negocio.', 403);
      this.productOwners.set(product.id, product.sellerId);
      if (!body) return product;
      dispatch();
      const updated = await productService.update(token, id, body); check();
      if (updated.sellerId !== seller.sellerId) throw new ApiError('invalid_response', 'El producto devuelto no pertenece al negocio autenticado.');
      return updated;
    });
  }

  /** Public catalogue is only a partial view of the seller inventory, never a private listing. */
  async visibleSellerProducts() {
    return this.commerce('product', async (token, user, check) => {
      const seller = await this.activeSeller(token, user, check);
      const products: ProductResponse[] = [];
      const ids = new Set<string>();
      let total: number | undefined;
      for (let page = 1; page <= 100; page++) {
        const result = await productService.getPage({ page, pageSize: 100 }); check();
        if (total !== undefined && total !== result.totalCount) throw new ApiError('invalid_response', 'El catálogo cambió durante la consulta. Actualiza e intenta de nuevo.');
        total = result.totalCount;
        for (const item of result.items) {
          if (ids.has(item.id)) throw new ApiError('invalid_response', 'El catálogo cambió durante la consulta. Actualiza e intenta de nuevo.');
          ids.add(item.id);
          if (item.sellerId === seller.sellerId) products.push(item);
        }
        if (ids.size === total) return products;
        if (ids.size > total || !result.items.length) break;
      }
      throw new ApiError('invalid_response', 'No se pudo consultar todo el catálogo público. Intenta de nuevo.');
    });
  }

  async updateProductStatus(id: string, input: ProductAvailabilityRequest) {
    const body = productAvailabilityBody(input);
    return this.commerce('product', async (token, user, check, dispatch) => {
      const seller = await this.activeSeller(token, user, check);
      // Paused products may no longer be public. Only ownership from validated responses in THIS session is cached.
      let owner = this.productOwners.get(id);
      if (!owner) { const product = await productService.getById(id); check(); owner = product.sellerId; }
      if (owner !== seller.sellerId) throw new ApiError('http', 'Este producto no pertenece a tu negocio.', 403);
      dispatch();
      const updated = await productService.updateStatus(token, id, body); check();
      if (updated.sellerId !== seller.sellerId) throw new ApiError('invalid_response', 'El producto devuelto no pertenece al negocio autenticado.');
      this.productOwners.set(updated.id, updated.sellerId);
      return updated;
    });
  }

  async createOrder(input: CreateOrderRequest, preparationId: string) {
    const body = createOrderBody(input);
    return this.commerce('order', async (token, user, check, dispatch) => {
      const product = await productService.getById(body.productId); check();
      if (!product.isAvailable || product.status !== 'Active' || body.quantity > product.stock) throw new ApiError('validation', 'El producto no está disponible en la cantidad solicitada.');
      dispatch();
      const order = await orderService.create(token, body); check();
      if (order.buyerId !== user.id || order.sellerId !== product.sellerId) throw new ApiError('invalid_response', 'El pedido no corresponde a la identidad o al producto seleccionado.');
      return order;
    }, `order:${preparationId}`);
  }

  async listBuyerOrders(page: number) {
    return this.commerce('order', async (token, user, check) => {
      const result = await orderService.mine(token, page); check();
      if (result.items.some((item) => item.role === 'buyer' && item.buyerId !== user.id)) throw new ApiError('invalid_response', 'El historial no corresponde a la sesión.');
      return { ...result, items: result.items.filter((item) => item.role === 'buyer') };
    });
  }

  async buyerOrder(orderId: string) {
    return this.commerce('order', async (token, user, check) => {
      const result = await orderService.detail(token, orderId); check();
      if (result.buyerId !== user.id) throw new ApiError('invalid_response', 'El pedido no corresponde a la sesión.');
      return result;
    });
  }

  sellerSubmissionState(): SellerSubmissionState { return { received: this.sellerSubmitted, uncertain: this.sellerOutcomeUnknown }; }

  /** Coalesce the complete lookup (including identity checks), not just its first HTTP request. */
  async sellerOperation(input?: SellerActivationRequest): Promise<SellerSessionResult> {
    this.deps.assertSecureTransport();
    if (!this.token) throw new ApiError('unauthenticated', 'Inicia sesión para administrar tu solicitud de vendedor.');
    if (!input && this.sellerLookup?.generation === this.generation) return this.sellerLookup.promise;
    if (this.sellerBusy) throw new ApiError('validation', 'Ya hay una operación de vendedor en curso.');
    if (input && this.sellerLookup?.generation === this.generation) throw new ApiError('validation', 'Espera la consulta de tu negocio antes de enviar el alta.');
    if (input && this.sellerSubmitted) throw new ApiError('validation', 'La solicitud ya fue recibida en esta sesión. Consulta con backend antes de repetirla.');
    if (input && this.sellerOutcomeUnknown) throw new ApiError('validation', 'El resultado anterior es incierto. Confirma su persistencia con backend antes de repetir.');
    const body = input ? activationBody(input) : undefined;
    if (body) return this.performSellerOperation(body);
    const promise = this.performSellerOperation();
    this.sellerLookup = { generation: this.generation, promise };
    const releaseLookup = () => { if (this.sellerLookup?.promise === promise) this.sellerLookup = undefined; };
    // Handle both outcomes of the cleanup branch while returning the ORIGINAL promise to its caller.
    void promise.then(releaseLookup, releaseLookup);
    return promise;
  }

  /** No token leaves this coordinator. Seller role requires validated /me, never the business DTO alone. */
  private async performSellerOperation(body?: SellerActivationRequest): Promise<SellerSessionResult> {
    const generation = this.generation;
    const token = this.token;
    if (!token) throw new ApiError('unauthenticated', 'Inicia sesión para consultar tu negocio.');
    if (body) this.sellerBusy = true;
    let profileChecked = false;
    try {
      let accepted: SellerActiveResponse | undefined;
      let status = 200;
      if (body) {
        const response = await sellerService.requestActivation(token, body);
        this.checkCurrent(generation);
        this.sellerSubmitted = true;
        accepted = response.data; status = response.status;
      }
      profileChecked = true;
      const lookup = await sellerService.lookupMe(token);
      this.checkCurrent(generation);
      if (lookup.kind === 'missing') {
        if (body) throw new ApiError('invalid_response', 'Alta recibida; todavía no se pudo confirmar el perfil. Reconsulta sin repetir el alta.');
        return { kind: 'missing', status: 404, roleSynced: false };
      }
      if (accepted && accepted.sellerId !== lookup.seller.sellerId) throw new ApiError('invalid_response', 'El perfil consultado no coincide con el negocio creado.');
      return await this.confirmedSellerResult(lookup.seller, status, token, generation);
    } catch (error) {
      this.checkCurrent(generation);
      if (error instanceof ApiError && error.status === 401) { this.token = null; await this.deps.storage.clear(); }
      const uncertainActivation = body && (!(error instanceof ApiError) || ['network', 'timeout', 'invalid_response'].includes(error.kind) || (error.status ?? 0) >= 500);
      if (uncertainActivation) {
        this.sellerOutcomeUnknown = true;
        if (!profileChecked) {
          // POST may have persisted or its DTO may have failed. Reconcile once with GET, NEVER retry POST.
          try {
            const lookup = await sellerService.lookupMe(token);
            this.checkCurrent(generation);
            if (lookup.kind === 'active') {
              this.sellerSubmitted = true;
              const confirmed = await this.confirmedSellerResult(lookup.seller, lookup.status, token, generation);
              return { ...confirmed, reconciled: true };
            }
          } catch (verificationError) {
            this.checkCurrent(generation);
            if (verificationError instanceof ApiError && verificationError.status === 401) {
              this.token = null; await this.deps.storage.clear();
              throw verificationError;
            }
            // Preserve the POST failure and the uncertain marker when the read cannot verify persistence.
          }
        }
      }
      throw error;
    } finally { if (body) this.sellerBusy = false; }
  }

  private async confirmedSellerResult(seller: SellerActiveResponse, status: number, token: string, generation: number): Promise<Extract<SellerSessionResult, { kind: 'active' }>> {
    let user: User | undefined;
    try {
      user = await this.validatedUser(token, requireSessionContract(this.deps.contract), generation);
      this.checkCurrent(generation);
    } catch (error) {
      this.checkCurrent(generation);
      if (error instanceof ApiError && error.status === 401) throw error;
      // A confirmed seller profile alone is insufficient to grant Seller privileges.
    }
    return { kind: 'active', status, seller, roleSynced: user?.role === 'seller', user };
  }
}

export function createAuthSession(): AuthSession {
  return new AuthSession({
    storage: sessionStorage,
    auth: authService,
    users: userService,
    contract: sessionContract,
    assertSecureTransport: () => httpClient.assertSecureTransport(),
  });
}
