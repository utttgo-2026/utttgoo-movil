import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { FoodImage } from '../FoodImage';
import { FoodCard } from '../FoodCard';
import { foodMedia, getFoodMedia } from '@/data/catalog/foodMedia';
import { mockFoods } from '@/data/mock';
import Category from '@/app/buyer/category';
import Detail from '@/app/buyer/food/[id]';
import OrderData from '@/app/buyer/(private)/order-data';
import ConfirmOrder from '@/app/buyer/(private)/confirm-order';
import Welcome from '@/app/(auth)/welcome';
import manifest from '../../../../specs/006-figma-ui-navigation-fixes/media-assets.generated.json';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-image', () => ({ Image: (props: object) => {
  const React = jest.requireActual('react');
  return React.createElement(jest.requireActual('react-native').View, props);
} }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), setParams: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'food-5', categoryId: 'cat-1' }),
}));
jest.mock('@/navigation/useSafeBack', () => ({ useSafeBack: () => jest.fn() }));
jest.mock('@/context/CartContext', () => ({ useCart: () => ({
  items: [{ food: jest.requireActual('@/data/mock').mockFoods.find((food: { id: string }) => food.id === 'food-5'), quantity: 2 }],
  subtotal: 90, itemCount: 2, clearCart: jest.fn(), addItem: jest.fn(),
}) }));

describe('Contrato de medios locales; no decodificación ni dispositivo nativo', () => {
  test('cubre exactamente los21 ids y pendientes no contienen otra fotografía', () => {
    expect(Object.keys(foodMedia).sort()).toEqual(mockFoods.map((food) => food.id).sort());
    expect(mockFoods).toHaveLength(21);
    expect(mockFoods.every((food) => food.image === undefined)).toBe(true);
    const pending = Object.values(foodMedia).filter((media) => media.provenance === 'pending');
    expect(pending).toHaveLength(11);
    expect(pending.every((media) => !media.thumbnail && !media.detail)).toBe(true);
    expect(getFoodMedia('unknown').provenance).toBe('pending');
    expect(getFoodMedia('__proto__').provenance).toBe('pending');
  });

  test('assets del manifiesto existen y coinciden con sus hashes/tamaño; presupuesto menor8MB', () => {
    let total = 0;
    for (const asset of manifest.assets) {
      for (const image of [asset.thumbnail, asset.detail]) {
        if (!image) continue;
        const bytes = readFileSync(path.join(process.cwd(), 'src/assets/images/foods', image.file));
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256);
        expect(bytes.length).toBe(image.bytes);
        expect(Math.max(image.width, image.height)).toBeLessThanOrEqual(960);
        total += bytes.length;
      }
    }
    expect(total).toBeLessThan(8 * 1024 * 1024);
  });

  test('error de imagen produce marcador neutro y reciclado a otro producto vuelve a cargar', async () => {
    const view = await render(<FoodImage foodId="food-1" name="Chilaquiles" />);
    await fireEvent(view.getByTestId('food-image-food-1'), 'error', { error: 'decode fixture' });
    expect(view.queryByTestId('food-image-food-1')).toBeNull();
    expect(view.getByLabelText('Imagen no disponible de Chilaquiles')).toBeTruthy();
    await view.rerender(<FoodImage foodId="food-2" name="Hotcakes" />);
    expect(view.getByTestId('food-image-food-2').props.source).toEqual(getFoodMedia('food-2').thumbnail);
    expect(view.queryByLabelText('Imagen no disponible de Chilaquiles')).toBeNull();
  });

  test('cambiar resolución tras error reinicia la carga de la misma identidad fotográfica', async () => {
    const view = await render(<FoodImage foodId="food-5" name="Torta" />);
    await fireEvent(view.getByTestId('food-image-food-5'), 'error', {});
    await view.rerender(<FoodImage foodId="food-5" name="Torta" variant="detail" />);
    expect(view.getByTestId('food-image-food-5').props.source).toEqual(getFoodMedia('food-5').detail);
    expect(view.getByTestId('food-image-food-5').props.recyclingKey).toContain('figma-UI-013');
  });

  test('producto pendiente no intenta cargar URI ni foto ajena', async () => {
    const view = await render(<FoodImage foodId="food-6" name="Quesadillas de Hongos" variant="detail" />);
    expect(view.queryByTestId('food-image-food-6')).toBeNull();
    expect(view.getByLabelText('Imagen no disponible de Quesadillas de Hongos')).toBeTruthy();
  });

  test.each([
    ['tarjeta', () => <FoodCard food={mockFoods.find((food) => food.id === 'food-5')!} width={180} onPress={() => {}} />, 'thumbnail'],
    ['categoría', () => <Category />, 'thumbnail'],
    ['detalle', () => <Detail />, 'detail'],
    ['datos del pedido', () => <OrderData />, 'thumbnail'],
    ['confirmación', () => <ConfirmOrder />, 'thumbnail'],
  ] as const)('%s usa la foto del id canónico, no del nombre/posición del carrito', async (_name, element, resolution) => {
    const view = await render(element());
    const image = view.getByTestId('food-image-food-5');
    expect(image.props.source).toEqual(getFoodMedia('food-5')[resolution]);
    expect(image.props.recyclingKey).toContain('food-5:figma-UI-013:');
  });

  test('bienvenida conserva tres acciones reales accesibles fuera del artwork', async () => {
    const view = await render(<Welcome />);
    expect(view.getByText('“Tu antojo, más cerca.”')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(view.getByRole('button', { name: 'Crear cuenta' })).toBeTruthy();
    expect(view.getByRole('button', { name: 'Seguir explorando' })).toBeTruthy();
  });
});
