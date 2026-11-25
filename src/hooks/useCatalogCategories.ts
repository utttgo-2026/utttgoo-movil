import { useEffect, useState } from 'react';
import { categoryService } from '@/services/api/categoryService';
import type { ApiCategory } from '@/types/api';
import { errorMessage } from '@/services/api/errors';
import { usesMockCatalog } from '@/config/catalogSource';
import { mockCategories } from '@/data/mock/categories';

export function useCatalogCategories(allowMocks = true, enabled = true) {
  const mock = allowMocks && usesMockCatalog();
  const [items, setItems] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(!mock);
  const [error, setError] = useState<string>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (mock || !enabled) return;
    let current = true;
    void categoryService.getAll().then((data) => { if (current) setItems(data); })
      .catch((cause: unknown) => { if (current) { setItems([]); setError(errorMessage(cause)); } })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [mock, revision, enabled]);
  return { items: mock ? mockCategories.map((category, index) => ({ id: category.id, name: category.name, sortOrder: index })) : items,
    loading, error, reload: () => { setLoading(true); setError(undefined); setRevision((value) => value + 1); } };
}
