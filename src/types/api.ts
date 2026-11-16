/** Contratos confirmados. Las respuestas aún no conocidas permanecen unknown. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

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
  businessName: string;
  description: string;
  pickupPoint: string;
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
export interface ApiPage<T> { items: T[]; page: number; pageSize: number; total: number }
export interface CreateProductRequest {
  name: string; description: string; ingredients: string[]; categoryId: string; price: number; stock: number;
}

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
}
