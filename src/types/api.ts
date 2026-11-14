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

/** Only Buyer is confirmed for this iteration; no inferred role priority/permissions. */
export type AwsRoles = ['Buyer'];

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

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
}
