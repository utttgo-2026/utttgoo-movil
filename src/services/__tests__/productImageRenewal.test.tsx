import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { RefreshingProductImage } from '@/components/catalog/RefreshingProductImage';
import { productService } from '../api/productService';
import type { ProductResponse } from '@/types/api';
import { productMetadata } from '../__fixtures__/product';
const product: ProductResponse = { ...productMetadata, id: 'fixture', sellerId: 'seller', name: 'Tacos', description: 'Fixture', ingredients: [], price: 25, stock: 4, categoryId: 'category', status: 'Active',
  imageUrl: 'https://utttgo.s3.amazonaws.com/a?old=1', imageUrlExpiresAt: '2000-01-01T00:00:00Z' };
describe('Imagen temporal en consumidor real', () => {
  afterEach(() => jest.restoreAllMocks());
  test('renueva por GET el mismo producto sin crear otro', async () => {
    const get = jest.spyOn(productService, 'getById').mockResolvedValue({ ...product, imageUrl: 'https://utttgo.s3.amazonaws.com/a?new=1', imageUrlExpiresAt: '2099-01-01T00:00:00Z' });
    const post = jest.spyOn(productService, 'create');
    const view = await render(<RefreshingProductImage product={product} />);
    await waitFor(() => expect(view.getByLabelText('Fotografía de Tacos')).toBeTruthy());
    expect(get).toHaveBeenCalledWith(product.id, 'product-image-renewal'); expect(get).toHaveBeenCalledTimes(1); expect(post).not.toHaveBeenCalled();
    await fireEvent(view.getByLabelText('Fotografía de Tacos'), 'error');
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy(); expect(get).toHaveBeenCalledTimes(1);
  });
  test.each([403, 404, 503])('GET fallido %i conserva placeholder sin bucle', async () => {
    const get = jest.spyOn(productService, 'getById').mockRejectedValue(new Error('fixture'));
    const view = await render(<RefreshingProductImage product={product} />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    await view.rerender(<RefreshingProductImage product={product} />); expect(get).toHaveBeenCalledTimes(1);
  });
  test('actualización explícita reinicia un intento acotado para un producto en caché', async () => {
    const get = jest.spyOn(productService, 'getById').mockRejectedValueOnce(new Error('fixture'))
      .mockResolvedValueOnce({ ...product, imageUrlExpiresAt: '2099-01-01T00:00:00Z' });
    const view = await render(<RefreshingProductImage key="revision-0" product={product} />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(view.getByLabelText('Imagen de producto no disponible')).toBeTruthy();
    await view.rerender(<RefreshingProductImage key="revision-1" product={product} />);
    await waitFor(() => expect(view.getByLabelText('Fotografía de Tacos')).toBeTruthy());
    expect(get).toHaveBeenCalledTimes(2);
  });
});
