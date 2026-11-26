/** Contratos confirmados. Las respuestas aún no conocidas permanecen unknown. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ApiError {
  correlationId: string;
  status: number;
  code: string;
  message: string;
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.correlationId === 'string' && typeof candidate.status === 'number' &&
    typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

export function parseApiError(value: unknown, status = 500): ApiError {
  if (isApiError(value)) return value;
  return { correlationId: '', status, code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' };
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Readonly<Record<string, string>>;
  data: T;
}

export interface HealthResponse {
  status: string;
  checks: { mongodb: string; redis: string };
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Exact combinations confirmed by backend; no Admin, reversed or extra roles inferred. */
export type AwsRoles = ['Buyer'] | ['Buyer', 'Seller'];

export interface AuthMeResponse {
  id: string;
  email: string;
  displayName: string;
  roles: AwsRoles;
  accountStatus: 'Active';
}

export interface UserProfileResponse {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: AwsRoles;
}

export interface RegisterRequest extends LoginRequest {
  displayName: string;
}

export interface UserPatch {
  displayName?: string;
  phone?: string;
}

export interface SellerActivationRequest {
  storeName: string;
  description: string;
  phone: string;
}

export type SellerPatch = Partial<SellerActivationRequest>;

export interface SellerActiveResponse extends SellerActivationRequest {
  sellerId: string;
  status: 'Active';
  isActive: true;
  roles: ['Buyer', 'Seller'];
  createdAt: string;
  updatedAt: string;
}
export interface ApiCategory { id: string; name: string; sortOrder: number }
export interface ApiPage<T> { items: T[]; page: number; pageSize: number; totalCount: number }
export interface CreateProductRequest {
  name: string; description: string; ingredients: string[]; categoryId: string; price: number; stock: number;
  imageUrl?: null;
  mediaAssetId?: string | null;
}
export type ProductSort = 'price_asc' | 'price_desc' | 'name_asc' | 'created_desc';
export type ProductStatus = 'Active' | 'Paused';
export interface ProductAvailabilityRequest { status: ProductStatus }
export interface ProductResponse extends Omit<CreateProductRequest, 'imageUrl' | 'mediaAssetId'> {
  id: string; sellerId: string; sellerDisplayName: string | null; categoryName: string | null;
  status: ProductStatus; isAvailable: boolean; ratingAverage: number | null; ratingCount: number | null;
  createdAt: string; updatedAt: string;
  imageUrl?: string | null; imageUrlExpiresAt?: string | null;
}
export interface ProductPage { items: ProductResponse[]; page: number; pageSize: number; totalCount: number }
export interface ProductPatch { price?: number; stock?: number; mediaAssetId?: string | null }
export interface CreateOrderRequest { productId: string; quantity: number; notes?: string }
export interface OrderResponse extends CreateOrderRequest {
  id: string; buyerId: string; sellerId: string; unitPrice: number; totalAmount: number;
  status: 'Pending'; createdAt: string;
}
/** PR24 deployed wire schema; orderResponse normalizes it into the existing receipt model above. */
export interface DeployedOrderResponse {
  orderId: string; productId: string; productName: string; sellerId: string; buyerUserId: string;
  quantity: number; unitPrice: number; total: number; currency: string; paymentMethod: string; status: string;
  pickupPoint: string; deliveredAt: string | null; completedAt: string | null;
  createdAt: string; updatedAt: string; version: number; notes?: string | null;
}

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
}
