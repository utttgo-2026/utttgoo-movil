import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { recordNavigation } from '@/navigation/diagnostics';

export function NavigationDiagnostics() {
  const pathname = usePathname();
  useEffect(() => { recordNavigation('route_view', pathname); }, [pathname]);
  return null;
}
