import { getGridMetrics, getTabBarHeight, groupRows } from '../useResponsive';

describe('Matriz responsiva P2 (cálculos, no medición de glifos nativos)', () => {
  const cases = [320, 360, 390, 430].flatMap((width) => [1, 1.3, 1.6, 2].map((scale) => [width, scale] as const));
  test.each(cases)('ancho%s / escala%s cabe sin overflow y no cambia tamaño de fuente', (width, scale) => {
    const grid = getGridMetrics(width, scale);
    expect(grid.cardWidth).toBeGreaterThan(0);
    expect(grid.cardWidth * grid.columns + 12 * (grid.columns - 1) + 32).toBeLessThanOrEqual(width + 0.01);
    if (scale >= 1.6 || width === 320) expect(grid.columns).toBe(1);
    if (width >= 360 && scale === 1) expect(grid.columns).toBe(2);
    expect(getTabBarHeight(scale, 34) - getTabBarHeight(scale, 0)).toBe(34);
  });
  test('agrupa sin eliminar/reordenar elementos y mantiene último producto', () => {
    const source = Array.from({ length: 21 }, (_, index) => index);
    expect(groupRows(source, 2).flat()).toEqual(source);
    expect(groupRows(source, 1).flat()).toEqual(source);
    expect(groupRows(source, 2).at(-1)).toEqual([20]);
  });
  test('medidas transitorias inválidas no producen NaN', () => {
    expect(Number.isFinite(getGridMetrics(NaN, NaN).cardWidth)).toBe(true);
    expect(getGridMetrics(0).cardWidth).toBeGreaterThan(0);
  });
});
