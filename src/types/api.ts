/** Solo contratos de solicitudes documentadas. Las respuestas aún no conocidas son unknown. */
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

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
}
