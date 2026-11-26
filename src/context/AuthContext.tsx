// @refresh reset
// Recreate the class coordinator on module refresh; JWT restoration still follows the existing flow.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, errorMessage } from '@/services/api/errors';
import { createAuthSession, type SellerSessionResult, type SellerSubmissionState } from '@/services/authSession';
import type { SellerActivationRequest, UserPatch, CreateProductRequest, ProductResponse, ProductPatch, ApiPage, ProductAvailabilityRequest } from '@/types/api';
import type { DeliveryCredential, OrderPr27, OrderStatus, OrderSummaryPr27, SellerOrderTarget } from '@/services/api/orderContractsPr27';
import { orderNotes } from '@/services/api/orderService';
import type { User, UserRole } from '@/types/models';
import type { LocalProductPhoto } from '@/services/productPhoto';
import type { Pr33MediaStatus } from '@/services/api/mediaPr33Simulation';
import { pushNotificationClient } from '@/services/notifications/pushNotifications';
import type { DeviceTokenResponse, RegisterDeviceTokenRequest } from '@/services/api/notificationService';

type AuthResult = { success: boolean; error?: string };
type SessionStatus = 'restoring' | 'anonymous' | 'authenticated' | 'blocked';
export type SellerOperationResult = ({ success: true; received: boolean; uncertain: boolean } & SellerSessionResult) |
  { success: false; error: string; status?: number; received?: boolean; uncertain?: boolean };
export type CommerceResult<T> = { success: true; data: T } | { success: false; error: string; reason?: 'uncertain' | 'confirmed' | 'conflict' };
export interface OrderPreparation { product: ProductResponse; quantity: number; key: string; notes: string }

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  status: SessionStatus;
  sessionError?: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  restoreSession: () => Promise<void>;
  refreshProfile: () => Promise<AuthResult>;
  updateProfile: (patch: UserPatch) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  registerDeviceToken: (input: RegisterDeviceTokenRequest) => Promise<DeviceTokenResponse>;
  unregisterDeviceToken: (deviceTokenId: string) => Promise<void>;
  requestSellerActivation: (input: SellerActivationRequest) => Promise<SellerOperationResult>;
  consultSeller: () => Promise<SellerOperationResult>;
  sessionProducts: ProductResponse[];
  createProduct: (input: CreateProductRequest) => Promise<CommerceResult<ProductResponse>>;
  consultProduct: (id: string, patch?: ProductPatch) => Promise<CommerceResult<ProductResponse>>;
  visibleSellerProducts: () => Promise<CommerceResult<ProductResponse[]>>;
  productPhotoOperation: (operation: 'upload' | 'confirm' | 'status', photo?: LocalProductPhoto) => Promise<CommerceResult<{ mediaAssetId: string; status: Pr33MediaStatus }>>;
  updateProductStatus: (id: string, input: ProductAvailabilityRequest) => Promise<CommerceResult<ProductResponse>>;
  orderPreparation: OrderPreparation | null;
  lastOrder: OrderPr27 | null;
  prepareOrder: (product: ProductResponse, quantity: number) => AuthResult;
  updateOrderNotes: (notes: string) => AuthResult;
  submitOrder: () => Promise<CommerceResult<OrderPr27>>;
  listBuyerOrders: (page: number) => Promise<CommerceResult<ApiPage<OrderSummaryPr27>>>;
  buyerOrder: (orderId: string) => Promise<CommerceResult<OrderPr27>>;
  orderRevision: number;
  listSellerOrders: (page: number, status?: OrderStatus) => Promise<CommerceResult<ApiPage<OrderSummaryPr27>>>;
  sellerOrder: (id: string) => Promise<CommerceResult<OrderPr27>>;
  cancelBuyerOrder: (id: string) => Promise<CommerceResult<OrderPr27>>;
  changeSellerOrder: (id: string, status: SellerOrderTarget) => Promise<CommerceResult<OrderPr27>>;
  issueDeliveryToken: (id: string) => Promise<CommerceResult<DeliveryCredential>>;
  confirmOrderDelivery: (id: string, token: string) => Promise<CommerceResult<OrderPr27>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
type SellerSessionPort = Pick<ReturnType<typeof createAuthSession>, 'sellerOperation' | 'sellerSubmissionState'>;
const sellerSessionReloadMessage = 'El módulo vendedor está desactualizado o es incompatible. Recarga completamente la app para restaurar la sesión y vuelve a validar.';

/** Fast Refresh can retain an instance created before a mandatory class method was introduced. */
function requireSellerSession(session: unknown): asserts session is SellerSessionPort {
  if (typeof session !== 'object' || !session) throw new ApiError('configuration', sellerSessionReloadMessage);
  const candidate = session as Record<string, unknown>;
  if (typeof candidate.sellerOperation !== 'function' || typeof candidate.sellerSubmissionState !== 'function') {
    throw new ApiError('configuration', sellerSessionReloadMessage);
  }
}
function readSellerSubmissionState(session: unknown): SellerSubmissionState {
  requireSellerSession(session);
  let value: unknown;
  try { value = session.sellerSubmissionState(); }
  catch { throw new ApiError('configuration', sellerSessionReloadMessage); }
  if (typeof value !== 'object' || !value) throw new ApiError('configuration', sellerSessionReloadMessage);
  const state = value as Record<string, unknown>;
  if (typeof state.received !== 'boolean' || typeof state.uncertain !== 'boolean') throw new ApiError('configuration', sellerSessionReloadMessage);
  // Only boolean metadata leaves the coordinator; never spread arbitrary runtime fields.
  return { received: state.received, uncertain: state.uncertain };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session] = useState(createAuthSession);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>('restoring');
  const [sessionError, setSessionError] = useState<string>();
  const revision = useRef(0);
  const [sessionProducts, setSessionProducts] = useState<ProductResponse[]>([]);
  const [orderPreparation, setOrderPreparation] = useState<OrderPreparation | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderPr27 | null>(null);
  const [orderRevision, setOrderRevision] = useState(0);
  const preparationRef = useRef<OrderPreparation | null>(null);
  const preparationSequence = useRef(0);
  const orderSubmitting = useRef(false);
  const resetCommerce = useCallback(() => {
    setSessionProducts([]); setOrderPreparation(null); preparationRef.current = null; setLastOrder(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const current = ++revision.current;
    resetCommerce();
    setUser(null);
    setStatus('restoring');
    setSessionError(undefined);
    try {
      const restored = await session.restore();
      if (current !== revision.current) return;
      setUser(restored);
      setStatus(restored ? 'authenticated' : 'anonymous');
    } catch (error) {
      if (current !== revision.current) return;
      setStatus('blocked');
      setSessionError(errorMessage(error));
    }
  }, [session, resetCommerce]);

  useEffect(() => {
    const revisionCounter = revision;
    const current = ++revisionCounter.current;
    let mounted = true;
    let cancelPending: (() => void) | undefined;
    const initialize = async () => {
      if (typeof session.restore !== 'function' || typeof session.cancelPendingOperations !== 'function') {
        throw new ApiError('configuration', sellerSessionReloadMessage);
      }
      cancelPending = session.cancelPendingOperations.bind(session);
      return session.restore();
    };
    void initialize().then((restored) => {
      if (!mounted || current !== revision.current) return;
      setUser(restored);
      setStatus(restored ? 'authenticated' : 'anonymous');
    }).catch((error: unknown) => {
      if (!mounted || current !== revision.current) return;
      setStatus('blocked');
      setSessionError(errorMessage(error));
    });
    return () => {
      mounted = false; ++revisionCounter.current;
      // No session work started if initialization rejected its mandatory lifecycle contract.
      if (cancelPending !== undefined) cancelPending();
    };
  }, [session]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const current = ++revision.current;
    resetCommerce();
    setUser(null);
    setStatus('anonymous');
    setSessionError(undefined);
    try {
      const loggedIn = await session.login(email, password);
      if (current !== revision.current) return { success: false };
      setUser(loggedIn);
      setStatus('authenticated');
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session, resetCommerce]);

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<AuthResult> => {
    try {
      await session.register(fullName, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  }, [session]);

  const loadProfile = useCallback(async (patch?: UserPatch): Promise<AuthResult> => {
    const current = ++revision.current;
    setUser(null);
    setStatus('restoring');
    setSessionError(undefined);
    try {
      const updated = await session.refreshProfile(patch);
      if (current !== revision.current) return { success: false };
      setUser(updated);
      setStatus('authenticated');
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        if (error instanceof ApiError && error.status === 401) resetCommerce();
        setUser(null);
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session, resetCommerce]);

  const logout = useCallback(async (): Promise<AuthResult> => {
    const current = ++revision.current;
    resetCommerce();
    setUser(null);
    setStatus('anonymous');
    setSessionError(undefined);
    try {
      void pushNotificationClient.stop({ unregister: true });
      await session.logout();
      if (current !== revision.current) return { success: false, error: 'La operación de sesión fue cancelada.' };
      return { success: true };
    } catch (error) {
      if (current === revision.current) {
        setStatus('blocked');
        setSessionError(errorMessage(error));
      }
      return { success: false, error: errorMessage(error) };
    }
  }, [session, resetCommerce]);

  const registerDeviceToken = useCallback((input: RegisterDeviceTokenRequest) => session.registerDeviceToken(input), [session]);
  const unregisterDeviceToken = useCallback((deviceTokenId: string) => session.unregisterDeviceToken(deviceTokenId), [session]);

  const refreshProfile = useCallback(() => loadProfile(), [loadProfile]);
  const runSeller = useCallback(async (input?: SellerActivationRequest): Promise<SellerOperationResult> => {
    const current = revision.current;
    if (status !== 'authenticated') return { success: false, error: 'Se requiere una sesión validada.' };
    let submission: SellerSubmissionState = { received: false, uncertain: false };
    let contractChecked = false;
    let operationStarted = false;
    try {
      submission = readSellerSubmissionState(session);
      contractChecked = true;
      operationStarted = true;
      const response = await session.sellerOperation(input);
      if (current !== revision.current) return { success: false, error: 'La operación de sesión fue cancelada.' };
      submission = readSellerSubmissionState(session);
      if (!response || (response.kind !== 'missing' && response.kind !== 'active') || typeof response.roleSynced !== 'boolean') {
        throw new ApiError('configuration', sellerSessionReloadMessage);
      }
      if (response.user) setUser(response.user);
      return { success: true, ...response, ...submission };
    } catch (error) {
      if (current !== revision.current) return { success: false, error: 'La operación de sesión fue cancelada.' };
      if (error instanceof ApiError && error.status === 401) {
        ++revision.current; resetCommerce(); setUser(null); setStatus('blocked'); setSessionError(errorMessage(error));
      }
      if (contractChecked) {
        try { submission = readSellerSubmissionState(session); }
        catch {
          // Never throw from the error handler or declare an attempted activation safe to repeat.
          submission = { ...submission, uncertain: submission.uncertain || !!(input && operationStarted) };
        }
      }
      if (input && operationStarted && error instanceof ApiError && error.kind === 'configuration') {
        submission = { ...submission, uncertain: true };
      }
      return { success: false, error: errorMessage(error), status: error instanceof ApiError ? error.status : undefined, ...submission };
    }
  }, [session, status, resetCommerce]);
  const requestSellerActivation = useCallback((input: SellerActivationRequest) => runSeller(input), [runSeller]);
  const consultSeller = useCallback(() => runSeller(), [runSeller]);
  const runCommerce = useCallback(async <T,>(operation: () => Promise<T>): Promise<CommerceResult<T>> => {
    const current = revision.current;
    if (status !== 'authenticated') return { success: false, error: 'Se requiere una sesión validada.' };
    try {
      const data = await operation();
      if (current !== revision.current) return { success: false, error: 'La operación de sesión fue cancelada.' };
      return { success: true, data };
    } catch (error) {
      if (current === revision.current && error instanceof ApiError && error.status === 401 && error.code !== 'S3_UPLOAD_FAILED') {
        ++revision.current; resetCommerce(); setUser(null); setStatus('blocked'); setSessionError(errorMessage(error));
      }
      const reason = error instanceof ApiError && (error.outcomeUncertain || error.code === 'ORDER_OUTCOME_UNCERTAIN' || error.code === 'PRODUCT_OUTCOME_UNCERTAIN') ? 'uncertain' :
        error instanceof ApiError && error.code === 'ORDER_ALREADY_CONFIRMED' ? 'confirmed' :
        error instanceof ApiError && (error.status === 409 || error.code === 'ORDER_STATE_CONFLICT') ? 'conflict' : undefined;
      return { success: false, error: errorMessage(error), ...(reason ? { reason } : {}) };
    }
  }, [status, resetCommerce]);
  const rememberProduct = useCallback((product: ProductResponse) => {
    setSessionProducts((items) => [product, ...items.filter((item) => item.id !== product.id)]);
  }, []);
  const createProduct = useCallback(async (input: CreateProductRequest) => {
    const current = revision.current;
    const result = await runCommerce(() => session.createProduct(input));
    if (current !== revision.current) return { success: false as const, error: 'La operación de sesión fue cancelada.' };
    if (result.success) rememberProduct(result.data);
    return result;
  }, [session, runCommerce, rememberProduct]);
  const consultProduct = useCallback(async (id: string, patch?: ProductPatch) => {
    const current = revision.current;
    const result = await runCommerce(() => session.ownProduct(id, patch));
    if (current !== revision.current) return { success: false as const, error: 'La operación de sesión fue cancelada.' };
    if (result.success) rememberProduct(result.data);
    return result;
  }, [session, runCommerce, rememberProduct]);
  const visibleSellerProducts = useCallback(() => runCommerce(() => session.visibleSellerProducts()), [runCommerce, session]);
  const productPhotoOperation = useCallback((operation: 'upload' | 'confirm' | 'status', photo?: LocalProductPhoto) => runCommerce(() => session.productPhotoOperation(operation, photo)), [runCommerce, session]);
  const updateProductStatus = useCallback(async (id: string, input: ProductAvailabilityRequest) => {
    const current = revision.current;
    const result = await runCommerce(() => session.updateProductStatus(id, input));
    if (current !== revision.current) return { success: false as const, error: 'La operación de sesión fue cancelada.' };
    if (result.success) rememberProduct(result.data);
    return result;
  }, [session, runCommerce, rememberProduct]);
  const prepareOrder = useCallback((product: ProductResponse, quantity: number): AuthResult => {
    if (orderSubmitting.current) return { success: false, error: 'Espera el resultado del pedido en curso.' };
    if (status !== 'authenticated' || !user) return { success: false, error: 'Inicia sesión para preparar tu pedido.' };
    if (!product.isAvailable || product.status !== 'Active' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 50 || quantity > product.stock) return { success: false, error: 'Elige una cantidad disponible, hasta 50 unidades.' };
    // One preparation is one product. Reopening the same preparation keeps its duplicate-protection key.
    const previous = preparationRef.current;
    const prepared = previous?.product.id === product.id && previous.quantity === quantity ? { ...previous, product } :
      { product, quantity, key: String(++preparationSequence.current), notes: '' };
    preparationRef.current = prepared; setOrderPreparation(prepared); setLastOrder(null);
    return { success: true };
  }, [status, user]);
  const updateOrderNotes = useCallback((notes: string): AuthResult => {
    if (status !== 'authenticated' || !preparationRef.current) return { success: false, error: 'Prepara un producto en tu sesión antes de añadir notas.' };
    if (orderSubmitting.current) return { success: false, error: 'Espera el resultado del pedido en curso.' };
    try {
      const updated = { ...preparationRef.current, notes: orderNotes(notes) };
      preparationRef.current = updated; setOrderPreparation(updated);
      return { success: true };
    } catch (error) { return { success: false, error: errorMessage(error) }; }
  }, [status]);
  const submitOrder = useCallback(async () => {
    if (orderSubmitting.current) return { success: false as const, error: 'Ya hay un pedido en curso.' };
    const prepared = preparationRef.current;
    if (!prepared) return { success: false as const, error: 'Prepara un producto antes de confirmar.' };
    const current = revision.current;
    orderSubmitting.current = true;
    try {
      const result = await runCommerce(() => session.createOrder({ productId: prepared.product.id, quantity: prepared.quantity,
        ...(prepared.notes ? { notes: prepared.notes } : {}) }, prepared.key));
      if (current !== revision.current) return { success: false as const, error: 'La operación de sesión fue cancelada.' };
      if (result.success) {
        setLastOrder(result.data);
        setOrderRevision((value) => value + 1);
        if (preparationRef.current?.key === prepared.key) { preparationRef.current = null; setOrderPreparation(null); }
      }
      return result;
    } finally { orderSubmitting.current = false; }
  }, [session, runCommerce]);
  const listBuyerOrders = useCallback((page: number) => runCommerce(() => session.listBuyerOrders(page)), [runCommerce, session]);
  const buyerOrder = useCallback((orderId: string) => runCommerce(() => session.buyerOrder(orderId)), [runCommerce, session]);
  const listSellerOrders = useCallback((page: number, filter?: OrderStatus) => runCommerce(() => session.listSellerOrders(page, filter)), [runCommerce, session]);
  const sellerOrder = useCallback((id: string) => runCommerce(() => session.sellerOrder(id)), [runCommerce, session]);
  const runOrderMutation = useCallback(async (operation: () => Promise<OrderPr27>) => {
    const result = await runCommerce(operation);
    if (result.success) setOrderRevision((value) => value + 1);
    return result;
  }, [runCommerce]);
  const cancelBuyerOrder = useCallback((id: string) => runOrderMutation(() => session.cancelBuyerOrder(id)), [session, runOrderMutation]);
  const changeSellerOrder = useCallback((id: string, target: SellerOrderTarget) => runOrderMutation(() => session.changeSellerOrder(id, target)), [session, runOrderMutation]);
  const issueDeliveryToken = useCallback((id: string) => runCommerce(() => session.issueDeliveryToken(id)), [session, runCommerce]);
  const confirmOrderDelivery = useCallback((id: string, token: string) => runOrderMutation(() => session.confirmOrderDelivery(id, token)), [session, runOrderMutation]);
  const value = useMemo<AuthContextValue>(() => ({
    user, role: user?.role ?? null, status, sessionError,
    isAuthenticated: status === 'authenticated' && user !== null,
    login, register, restoreSession, refreshProfile, updateProfile: loadProfile, logout, registerDeviceToken, unregisterDeviceToken, requestSellerActivation, consultSeller,
    sessionProducts, createProduct, consultProduct, visibleSellerProducts, productPhotoOperation, updateProductStatus, orderPreparation, lastOrder, prepareOrder, updateOrderNotes, submitOrder, listBuyerOrders, buyerOrder,
    orderRevision, listSellerOrders, sellerOrder, cancelBuyerOrder, changeSellerOrder, issueDeliveryToken, confirmOrderDelivery,
  }), [user, status, sessionError, login, register, restoreSession, refreshProfile, loadProfile, logout, registerDeviceToken, unregisterDeviceToken, requestSellerActivation, consultSeller,
    sessionProducts, createProduct, consultProduct, visibleSellerProducts, productPhotoOperation, updateProductStatus, orderPreparation, lastOrder, prepareOrder, updateOrderNotes, submitOrder, listBuyerOrders, buyerOrder,
    orderRevision, listSellerOrders, sellerOrder, cancelBuyerOrder, changeSellerOrder, issueDeliveryToken, confirmOrderDelivery]);

  // Las pantallas pueden renderizar errores o explorar como invitado durante restauración.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
}
