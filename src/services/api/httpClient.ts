import type { ApiResponse, JsonValue } from '@/types/api';

import { getApiBaseUrl, parseApiBaseUrl } from './config';
import { ApiError, httpErrorMessage } from './errors';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: JsonValue;
  token?: string;
  query?: Readonly<Record<string, string | number | undefined>>;
  expectedStatuses?: readonly number[];
  timeoutMs?: number;
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
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const response = await (this.options.fetch ?? fetch)(url.toString(), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        // Soporte nativo de redirects debe verificarse; nunca usar endpoints que hagan downgrade.
        redirect: 'error',
        credentials: 'omit',
      });
      const text = await response.text();
      if (timedOut) throw new ApiError('timeout', 'El servidor tardó demasiado en responder.');
      let data: unknown = null;
      let validJson = true;
      if (text.trim()) {
        try { data = JSON.parse(text) as unknown; } catch { validJson = false; }
      }
      if (!response.ok) {
        throw new ApiError('http', httpErrorMessage(response.status), response.status, data);
      }
      if (!validJson || (options.expectedStatuses && !options.expectedStatuses.includes(response.status))) {
        throw new ApiError('invalid_response', 'La API devolvió una respuesta no compatible con el contrato esperado.', response.status);
      }
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => { responseHeaders[key] = value; });
      return { status: response.status, headers: responseHeaders, data };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (timedOut) throw new ApiError('timeout', 'El servidor tardó demasiado en responder.');
      throw new ApiError('network', 'No fue posible conectar con la API. Revisa la red y las restricciones de transporte del dispositivo.');
    } finally {
      clearTimeout(timer);
    }
  }
}

export const httpClient = new HttpClient();
