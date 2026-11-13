import { act, renderHook } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import { useSafeBack } from '../useSafeBack';

const mockRouter = { canGoBack: jest.fn(), back: jest.fn(), replace: jest.fn() };
let mockPathname = '/buyer';
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));

describe('Regreso Android sin dispositivo (listener simulado)', () => {
  let dispatchBack: () => boolean | null | undefined;
  const remove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.canGoBack.mockReturnValue(false);
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, listener) => {
      dispatchBack = () => listener({ type: 'hardwareBackPress', timeStamp: 0 });
      return { remove };
    });
  });
  afterEach(() => jest.restoreAllMocks());

  test('raíz sin historial delega salida normal al sistema', async () => {
    mockPathname = '/buyer';
    await renderHook(() => useSafeBack());
    expect(dispatchBack()).toBe(false);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  test('pantalla secundaria sin historial consume back y vuelve al catálogo', async () => {
    mockPathname = '/buyer/food/food-5';
    await renderHook(() => useSafeBack());
    expect(dispatchBack()).toBe(true);
    expect(mockRouter.replace).toHaveBeenCalledWith('/buyer');
  });

  test('con historial permite navegación nativa sin ejecutar un segundo back', async () => {
    mockPathname = '/buyer/category';
    mockRouter.canGoBack.mockReturnValue(true);
    const view = await renderHook(() => useSafeBack());
    expect(dispatchBack()).toBe(false);
    expect(mockRouter.back).not.toHaveBeenCalled();
    await act(async () => view.result.current());
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    await view.unmount();
    expect(remove).toHaveBeenCalled();
  });
});
