export type NavigationEvent = 'route_view' | 'back' | 'fallback' | 'android_back' |
  'history_exhausted' | 'route_not_found' | 'execution_error';

const knownPaths = new Set([
  '/', '/welcome', '/login', '/register', '/forgot-password', '/verify-email',
  '/buyer', '/buyer/search', '/buyer/orders', '/buyer/notifications', '/buyer/profile',
  '/buyer/category', '/buyer/filters', '/buyer/available-now', '/buyer/order-data',
  '/buyer/confirm-order', '/buyer/order-created', '/buyer/order-tracking',
  '/buyer/rate-order', '/buyer/cancel-order',
]);

export function diagnosticRoute(pathname: string): string {
  const path = pathname.split(/[?#]/)[0];
  if (knownPaths.has(path)) return path;
  if (/^\/buyer\/food\/[^/]+$/.test(path)) return '/buyer/food/[id]';
  return '[unknown]';
}

/** No queries, identificadores reales, errores crudos, credenciales ni estado de usuario. */
export function recordNavigation(event: NavigationEvent, pathname: string): void {
  if (__DEV__) console.info('[navigation]', { event, route: diagnosticRoute(pathname) });
}
