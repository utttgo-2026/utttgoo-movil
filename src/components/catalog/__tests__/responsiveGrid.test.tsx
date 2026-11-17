import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as RN from 'react-native';

import { ResponsiveFoodGrid } from '../ResponsiveFoodGrid';
import { AppButton, AppText } from '@/components/ui';
import { mockFoods } from '@/data/mock';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const mockMetrics = { width: 390, height: 844, scale: 1, fontScale: 1 };
jest.mock('@/hooks/useResponsive', () => ({
  ...jest.requireActual('@/hooks/useResponsive'), useWindowDimensions: () => mockMetrics,
}));
function Harness() {
  const [query, setQuery] = useState('');
  return <ResponsiveFoodGrid testID="responsive" foods={mockFoods.slice(0, 2)} onFoodPress={() => {}}
    header={<RN.TextInput placeholder="Consulta fixture" value={query} onChangeText={setQuery} />} />;
}

describe('Reflujo sin reconstruir lista ni input', () => {
  beforeEach(() => { mockMetrics.width = 390; mockMetrics.fontScale = 1; jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

  test('cambia2→1 columnas conservando input, búsqueda, lista y offset', async () => {
    const scroll = jest.spyOn(RN.FlatList.prototype, 'scrollToOffset').mockImplementation(() => {});
    const view = await render(<Harness />);
    const input = view.getByPlaceholderText('Consulta fixture');
    const list = view.getByTestId('responsive');
    await fireEvent.changeText(input, 'Torta');
    expect(view.getAllByTestId('responsive-row')).toHaveLength(1);
    await fireEvent.scroll(list, { nativeEvent: { contentOffset: { x: 0, y: 120 }, layoutMeasurement: { width: 390, height: 600 }, contentSize: { width: 390, height: 1200 } } });
    mockMetrics.width = 320; mockMetrics.fontScale = 2;
    await view.rerender(<Harness />);
    await act(async () => { jest.runOnlyPendingTimers(); });
    expect(view.getAllByTestId('responsive-row')).toHaveLength(2);
    expect(view.getByPlaceholderText('Consulta fixture')).toBe(input);
    expect(view.getByPlaceholderText('Consulta fixture').props.value).toBe('Torta');
    expect(view.getByTestId('responsive')).toBe(list);
    expect(scroll).toHaveBeenCalledWith({ offset: 120, animated: false });
  });

  test('botón loading conserva etiqueta/reserva y accesibilidad nativa', async () => {
    const view = await render(<AppButton label="Acción larga accesible" onPress={() => {}} />);
    const label = view.getByText('Acción larga accesible');
    await view.rerender(<AppButton label="Acción larga accesible" loading />);
    expect(view.getByText('Acción larga accesible')).toBe(label);
    expect(view.getByRole('button', { name: 'Acción larga accesible' }).props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    await view.rerender(<AppText>Texto accesible</AppText>);
    expect(view.getByText('Texto accesible').props.allowFontScaling).not.toBe(false);
  });
});
