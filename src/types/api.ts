export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ApiError {
  correlationId: string;
  status: number;
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Readonly<Record<string, string>>;
  data: T;
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

export interface HealthResponse { status: string; checks: { mongodb: string; redis: string } }
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest extends LoginRequest { displayName: string }

export type BackendRole = 'Buyer' | 'Seller' | 'Admin';
export type AwsRoles = BackendRole[];
export type AccountStatus = 'PendingEmailVerification' | 'Active' | 'Suspended';

export interface AuthMeResponse {
  id: string;
  email: string;
  displayName: string;
  roles: AwsRoles;
  accountStatus: 'Active';
}

export interface UserMeResponse {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: AwsRoles;
}

export type UserProfileResponse = UserMeResponse;
export interface UserPatch { displayName?: string; phone?: string }
export interface SellerActivationRequest { businessName: string; description: string; pickupPoint: string }
export type SellerPatch = Partial<SellerActivationRequest>;
export interface AdminUsersQuery { page?: number; pageSize?: number }
