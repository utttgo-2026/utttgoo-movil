import { formatCurrency, formatDate, formatTime, orderStatusLabels } from '@/utils/format';

describe('format utilities', () => {
  it('formats Mexican currency', () => {
    expect(formatCurrency(42.5)).toContain('42.50');
    expect(formatCurrency(42.5)).toContain('$');
  });

  it('formats dates and order labels', () => {
    expect(formatDate('2026-01-02T12:00:00.000Z')).toContain('2026');
    expect(formatTime('2026-01-02T12:00:00.000Z')).toMatch(/\d{2}:\d{2}/);
    expect(orderStatusLabels.pending).toBe('Pendiente');
  });
});
