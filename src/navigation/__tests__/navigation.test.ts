import { backFallback, categoryRoute, foodDetailRoute, isNavigationRoot, navigateBack } from '../buyerRoutes';
import { diagnosticRoute, recordNavigation } from '../diagnostics';

describe('Rutas y regreso seguro006', () => {
  test('detalle y categoría usan segmentos y parámetros reales', () => {
    expect(foodDetailRoute('food-5')).toEqual({ pathname: '/buyer/food/[id]', params: { id: 'food-5' } });
    expect(categoryRoute('cat-1')).toEqual({ pathname: '/buyer/category', params: { categoryId: 'cat-1' } });
  });

  test('con historial vuelve al origen sin insertar/reemplazar rutas', () => {
    const router = { canGoBack: () => true, back: jest.fn(), replace: jest.fn() };
    expect(navigateBack(router, '/buyer')).toBe('back');
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('sin historial usa fallback público, nunca login genérico', () => {
    const router = { canGoBack: () => false, back: jest.fn(), replace: jest.fn() };
    expect(navigateBack(router, backFallback('/buyer/food/food-5'))).toBe('fallback');
    expect(router.replace).toHaveBeenCalledWith('/buyer');
    expect(router.back).not.toHaveBeenCalled();
    expect(backFallback('/buyer/category')).toBe('/buyer/search');
    expect(backFallback('/register')).toBe('/welcome');
  });

  test.each(['/', '/welcome', '/buyer'])('solo raíz %s puede agotar historial y salir normalmente', (path) => {
    expect(isNavigationRoot(path)).toBe(true);
    expect(isNavigationRoot('/buyer/food/food-5')).toBe(false);
  });

  test('diagnósticos no exponen query, ids reales ni rutas arbitrarias', () => {
    expect(diagnosticRoute('/buyer/food/private-id?token=secret')).toBe('/buyer/food/[id]');
    expect(diagnosticRoute('/buyer/search?query=secret')).toBe('/buyer/search');
    expect(diagnosticRoute('/unknown/private-data')).toBe('[unknown]');
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    recordNavigation('execution_error', '/buyer/food/private-id?token=secret');
    expect(log).toHaveBeenCalledWith('[navigation]', { event: 'execution_error', route: '/buyer/food/[id]' });
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    log.mockRestore();
  });
});
