import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/services/api/errors';
import { healthService } from '@/services/api/healthService';
import type { ApiResponse, HealthResponse } from '@/types/api';

/** Diagnóstico público manual: jamás adjunta token. */
export function useApiHealth() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse<HealthResponse> | null>(null);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const check = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setResponse(null);
    try {
      const result = await healthService.getHealth();
      if (mounted.current) setResponse(result);
    } catch (cause) {
      if (mounted.current) setError(errorMessage(cause));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  return { loading, response, error, check };
}
