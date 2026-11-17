import React from 'react';
import { AccessibilityInfo, Animated, Text } from 'react-native';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react-native';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { animateValue, useMotionValue } from '@/hooks/useMotion';
import { motion, stackMotionOptions, tabIndicatorX } from '@/navigation/motion';
import { AppButton } from '@/components/ui/AppButton';
import { MotionPressable } from '@/components/ui/MotionPressable';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { getTabBarHeight } from '@/hooks/useResponsive';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('Preferencia de movimiento y feedback sin modificar acciones', () => {
  let change: (value: boolean) => void;
  const remove = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'reduceMotionChanged') change = handler as (value: boolean) => void;
      return { remove };
    });
  });
  afterEach(() => jest.restoreAllMocks());
  test('preferencia compartida responde en vivo y elimina la suscripción al último consumidor', async () => {
    const view = await renderHook(() => [useReducedMotion(), useReducedMotion()]);
    await waitFor(() => expect(view.result.current).toEqual([false, false]));
    expect(AccessibilityInfo.addEventListener).toHaveBeenCalledTimes(1);
    await act(async () => change(true));
    expect(view.result.current).toEqual([true, true]);
    await view.unmount(); expect(remove).toHaveBeenCalledTimes(1);
  });
  test('consulta inicial tardía no sobrescribe cambio del sistema más reciente', async () => {
    let finish!: (value: boolean) => void;
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const view = await renderHook(useReducedMotion);
    expect(view.result.current).toBe(true);
    await act(async () => { change(true); finish(false); });
    expect(view.result.current).toBe(true);
  });
  test('fallo de la consulta mantiene movimiento reducido', async () => {
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockRejectedValue(new Error('fixture native unavailable'));
    const view = await renderHook(useReducedMotion);
    expect(view.result.current).toBe(true);
  });
  test('actualizaciones tardías tras desmontar no afectan a una nueva suscripción', async () => {
    const first = await renderHook(useReducedMotion);
    const oldChange = change;
    await first.unmount();
    const second = await renderHook(useReducedMotion);
    await waitFor(() => expect(second.result.current).toBe(false));
    await act(async () => oldChange(true));
    expect(second.result.current).toBe(false);
  });
  test('selección rápida cancela trayectoria anterior y ReduceMotion cancela la última sin cola', async () => {
    const { result, rerender } = await renderHook<Animated.Value, { target: number; reduced: boolean }>(({ target, reduced }) => useMotionValue(target, motion.tab, reduced), { initialProps: { target: 0, reduced: false } });
    const stop = jest.spyOn(result.current, 'stopAnimation');
    const set = jest.spyOn(result.current, 'setValue');
    const timing = jest.spyOn(Animated, 'timing');
    await rerender({ target: 200, reduced: false });
    await rerender({ target: 40, reduced: false });
    expect(stop.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(timing).toHaveBeenLastCalledWith(result.current, expect.objectContaining({ toValue: 40, duration: 220, useNativeDriver: true, isInteraction: false }));
    await rerender({ target: 40, reduced: true });
    expect(set).toHaveBeenLastCalledWith(40);
    const count = timing.mock.calls.length;
    animateValue(result.current, 70, true, 220);
    expect(set).toHaveBeenLastCalledWith(70); expect(timing).toHaveBeenCalledTimes(count);
  });
  test('pulsación visual no demora callback, respeta disabled/loading y cambia preferencia en vivo', async () => {
    const callback = jest.fn();
    const view = await render(<AppButton label="Confirmar fixture" onPress={callback} />);
    await waitFor(() => expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled());
    const timing = jest.spyOn(Animated, 'timing');
    await fireEvent(view.getByRole('button'), 'pressIn');
    await fireEvent.press(view.getByRole('button'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(expect.any(Animated.Value), expect.objectContaining({ toValue: 0.98, duration: 80 }));
    await act(async () => change(true)); timing.mockClear();
    await fireEvent(view.getByRole('button'), 'pressIn');
    expect(timing).not.toHaveBeenCalled();
    await view.rerender(<AppButton label="Confirmar fixture" onPress={callback} loading />);
    await fireEvent.press(view.getByRole('button'));
    expect(callback).toHaveBeenCalledTimes(1); expect(view.getByRole('button')).toBeDisabled();
  });
  test('tarjeta conserva longpress y no ejecuta acción al iniciar feedback', async () => {
    const press = jest.fn(); const long = jest.fn();
    const view = await render(<MotionPressable accessibilityRole="button" accessibilityLabel="Producto fixture" onPress={press} onLongPress={long}><Text>Producto</Text></MotionPressable>);
    await fireEvent(view.getByRole('button'), 'pressIn'); expect(press).not.toHaveBeenCalled();
    await fireEvent(view.getByRole('button'), 'longPress'); expect(long).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByRole('button')); expect(press).toHaveBeenCalledTimes(1);
  });
  test('feedback no retiene texto al desmontar ni cambia identidad de contenido al actualizar estado', async () => {
    const view = await render(<MotionFeedback trigger="loading"><Text testID="stable-content">Cargando fixture</Text></MotionFeedback>);
    const content = view.getByTestId('stable-content');
    await view.rerender(<MotionFeedback trigger="ready"><Text testID="stable-content">Contenido fixture</Text></MotionFeedback>);
    expect(view.getByTestId('stable-content')).toBe(content);
    await view.rerender(<Text>Sesión cerrada fixture</Text>);
    expect(view.queryByText('Contenido fixture')).toBeNull();
  });
});

describe('Política nativa y geometría de cinco tabs', () => {
  test.each([320, 360, 390, 430])('indicador permanece dentro de cada tab a %sdp y respeta insets/RTL', (width) => {
    for (const inset of [0, 16]) for (const rtl of [false, true]) for (let index = 0; index < 5; index++) {
      const x = tabIndicatorX(width, index, 5, inset, rtl);
      const visualIndex = rtl ? 4 - index : index;
      const cell = (width - inset * 2) / 5;
      expect(x).toBeGreaterThanOrEqual(inset + visualIndex * cell);
      expect(x + 22).toBeLessThanOrEqual(inset + (visualIndex + 1) * cell);
    }
    for (const scale of [1, 1.3, 1.6, 2]) {
      const height = getTabBarHeight(scale, 34, width);
      const textLines = scale >= 1.3 ? 2 : 1;
      expect(height - 34).toBeGreaterThanOrEqual(28 + Math.ceil(16 * scale) * textLines + 20);
      expect(height - getTabBarHeight(scale, 0, width)).toBe(34);
    }
  });
  test.each(['food/[id]', 'category', '(private)', 'order-data', 'confirm-order', '(auth)/login', '(auth)/register', 'seller', 'product-draft'])('Stack%s conserva gesto y deslizamiento horizontal, ReduceMotion usa none', (route) => {
    expect(stackMotionOptions(false, route)).toMatchObject({ animation: 'slide_from_right', gestureEnabled: true });
    expect(stackMotionOptions(true, route)).toMatchObject({ animation: 'none', gestureEnabled: true });
  });
  test('filtros tienen entrada vertical sin cambiar presentación a modal', () => {
    expect(stackMotionOptions(false, 'filters')).toMatchObject({ animation: 'slide_from_bottom' });
    expect(stackMotionOptions(false, 'filters').presentation).toBeUndefined();
    expect(stackMotionOptions(true, 'filters').animation).toBe('none');
  });
});
