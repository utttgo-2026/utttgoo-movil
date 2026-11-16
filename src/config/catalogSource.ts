/** Production always AWS. No fallback from failed requests to fixtures. */
export function usesMockCatalog() { return __DEV__ && process.env.EXPO_PUBLIC_CATALOG_SOURCE === 'mock'; }
