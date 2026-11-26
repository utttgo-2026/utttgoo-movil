import type { ApiResponse, JsonValue } from '@/types/api';

import { getApiBaseUrl, parseApiBaseUrl } from './config';
import { ApiError, backendHttpError } from './errors';
import { registrationDiagnostic } from './registrationDiagnostics';
import { catalogRequestSummary, safeCorrelationId, type CatalogSource } from './requestDiagnostics';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: JsonValue;
  token?: string;
  query?: Readonly<Record<string, string | number | undefined>>;
  expectedStatuses?: readonly number[];
  timeoutMs?: number;
  diagnosticSource?: CatalogSource;
  idempotencyKey?: string;
}

interface HttpClientOptions {
  baseUrl?: () => string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export class HttpClient {
  constructor(private readonly options: HttpClientOptions = {}) {}

  /** También se usa antes de intentar auth, para no enviar credenciales por HTTP. */
  assertSecureTransport(): void {
    if (!this.baseUrl().startsWith('https://')) {
      throw new ApiError('insecure_transport', 'La autenticación y los datos de cuenta requieren HTTPS. Solo está disponible la comprobación pública de conexión.');
    }
  }

  private baseUrl(): string {
    return parseApiBaseUrl((this.options.baseUrl ?? getApiBaseUrl)());
  }

  async request(path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    const method = options.method ?? 'GET';
    // Los servicios usan rutas constantes; impedir cambio de origen o URLs absolutas.
    if (!/^\/[a-zA-Z0-9/_%.-]+$/.test(path) || path.includes('..') || path.startsWith('//')) {
      throw new ApiError('configuration', 'Ruta de API inválida.');
    }
    const baseUrl = this.baseUrl();
    const publicHealth = path === '/health' && method === 'GET' &&
      options.token === undefined && options.body === undefined && options.query === undefined;
    if (!baseUrl.startsWith('https://') && !publicHealth) {
      throw new ApiError('insecure_transport', 'Esta petición requiere HTTPS. No se enviaron credenciales ni datos al servidor.');
    }
    if (options.token !== undefined && (!options.token.trim() || /\s/.test(options.token))) {
      throw new ApiError('unauthenticated', 'Se requiere una sesión válida.');
    }
    if (method === 'GET' && options.body !== undefined) {
      throw new ApiError('validation', 'GET no admite cuerpo.');
    }
    const timeoutMs = options.timeoutMs ?? this.options.timeoutMs ?? 10000;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new ApiError('configuration', 'Timeout de API inválido.');
    }
    const url = new URL(`${baseUrl}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const headers: Record<string, string> = { Accept: 'application/json' };
    const diagnosticRequest = catalogRequestSummary(method, path, options.body, options.query, baseUrl, options.diagnosticSource);
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    const freshOrderRead = method === 'GET' && options.token !== undefined && (path.startsWith('/api/v1/orders/') || path === '/api/v1/sellers/me/orders');
    if (freshOrderRead) headers['Cache-Control'] = 'no-cache';
    if (options.idempotencyKey !== undefined) {
      if (path !== '/api/v1/orders' || method !== 'POST' || !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(options.idempotencyKey)) throw new ApiError('validation', 'No se pudo preparar la compra. Vuelve a seleccionar el alimento.');
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const registration = path === '/api/v1/auth/register' && method === 'POST';
      if (registration) registrationDiagnostic({ event: 'request_start', origin: baseUrl });
      const response = await (this.options.fetch ?? fetch)(url.toString(), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        // Soporte nativo de redirects debe verificarse; nunca usar endpoints que hagan downgrade.
        redirect: 'error',
        credentials: 'omit',
        ...(freshOrderRead ? { cache: 'no-store' as const } : {}),
      });
      // Capture the actual status even when parsing or expected-status checks later fail.
      if (registration) registrationDiagnostic({ event: 'response', status: response.status });
      const text = await response.text();
      if (timedOut) throw new ApiError('timeout', 'El servidor tardó demasiado en responder.');
      let data: unknown = null;
      let validJson = true;
      if (text.trim()) {
        try { data = JSON.parse(text) as unknown; } catch { validJson = false; }
      }
      if (!response.ok) {
        const failure = backendHttpError(response.status, data);
        for (const name of ['x-correlation-id', 'correlation-id', 'x-request-id', 'request-id', 'traceparent']) {
          const correlation = safeCorrelationId(response.headers.get(name));
          if (correlation) { failure.responseCorrelationId = correlation; break; }
        }
        throw failure;
      }
      if (!validJson || (options.expectedStatuses && !options.expectedStatuses.includes(response.status))) {
        throw new ApiError('invalid_response', 'La API devolvió una respuesta no compatible con el contrato esperado.', response.status);
      }
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });
      return { status: response.status, headers: responseHeaders, data };
    } catch (error) {
      const failure = error instanceof ApiError ? error : timedOut ? new ApiError('timeout', 'El servidor tardó demasiado en responder.') : new ApiError('network', 'No fue posible conectar con la API. Revisa la red y las restricciones de transporte del dispositivo.');
      if (diagnosticRequest) failure.diagnosticRequest = diagnosticRequest;
      throw failure;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const httpClient = new HttpClient();
