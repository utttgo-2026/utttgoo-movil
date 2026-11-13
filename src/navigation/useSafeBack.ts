import { useFocusEffect, usePathname, useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import { backFallback, isNavigationRoot, navigateBack } from './buyerRoutes';
import { recordNavigation } from './diagnostics';

export function useSafeBack(explicitFallback?: Href) {
  const router = useRouter();
  const pathname = usePathname();
  const fallback = explicitFallback ?? backFallback(pathname);

  const goBack = useCallback(() => {
    recordNavigation(router.canGoBack() ? 'back' : 'fallback', pathname);
    navigateBack(router, fallback);
  }, [router, pathname, fallback]);

  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) {
        recordNavigation('android_back', pathname);
        return false; // React Navigation conserva historial, tabs y gesto nativo.
      }
      if (isNavigationRoot(pathname)) {
        recordNavigation('history_exhausted', pathname);
        return false; // Salida normal de Android, no una excepción diagnosticada.
      }
      goBack();
      return true;
    });
    return () => listener.remove();
  }, [router, pathname, goBack]));

  return goBack;
}
