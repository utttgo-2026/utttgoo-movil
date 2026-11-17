import type { Href } from 'expo-router';

export function foodDetailRoute(id: string): Href {
  return { pathname: '/buyer/food/[id]', params: { id } };
}

export function categoryRoute(categoryId: string): Href {
  return { pathname: '/buyer/category', params: { categoryId } };
}

export function backFallback(pathname: string): Href {
  if (pathname === '/buyer/category' || pathname === '/buyer/filters') return '/buyer/search';
  return pathname.startsWith('/buyer') ? '/buyer' : '/welcome';
}

export function isNavigationRoot(pathname: string): boolean {
  return pathname === '/' || pathname === '/welcome' || pathname === '/buyer';
}

export interface BackRouter {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
}

export function navigateBack(router: BackRouter, fallback: Href): 'back' | 'fallback' {
  if (router.canGoBack()) {
    router.back();
    return 'back';
  }
  // Solo sin historial: no insertar otro destino que cause un bucle de regresos.
  router.replace(fallback);
  return 'fallback';
}
