import React, { useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { priceInCents } from '@/utils/sellerValidation';
import { createProductBody } from '@/services/api/productService';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { FilterChip } from '@/components/catalog/FilterChip';
import { ApiError, errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';

export default function ProductDraftScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const categories = useCatalogCategories(false);
  const [preview, setPreview] = useState<{ name: string; description: string; cents: number; stock: number }>();
  const [error, setError] = useState<string>();
  const showPreview = () => {
    setError(undefined); setPreview(undefined);
    try {
      if (!/^\d+$/.test(stock)) throw new ApiError('validation', 'Stock debe ser entero no negativo.');
      const body = createProductBody({ name, description, price: priceInCents(price) / 100, stock: Number(stock), categoryId,
        ingredients: ingredients.split(',').map((value) => value.trim()).filter(Boolean) }, categories.items.map((item) => item.id));
      setPreview({ name: body.name, description: body.description, cents: Math.round(body.price * 100), stock: body.stock });
    }
    catch (cause) { setError(errorMessage(cause)); }
  };
  return <Screen scroll constrained header={<AppHeader title="Agregar alimento" backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Preparación local, no publicada. Los campos se pierden al salir; no se envían a AWS ni al catálogo comprador.</AppText>
      <AppText variant="caption">Media pendiente: no se envía imagen en este contrato.</AppText>
      <AppInput label="Nombre" accessibilityLabel="Nombre del alimento" value={name} onChangeText={setName} placeholder="Nombre del alimento" />
      <AppInput label="Descripción" accessibilityLabel="Descripción del alimento" value={description} onChangeText={setDescription} multiline placeholder="Descripción del alimento" />
      <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" keyboardType="decimal-pad" value={price} onChangeText={setPrice} placeholder="0.00" />
      <AppInput label="Ingredientes (separados por coma)" accessibilityLabel="Ingredientes" value={ingredients} onChangeText={setIngredients} />
      <AppInput label="Stock" accessibilityLabel="Stock" keyboardType="number-pad" value={stock} onChangeText={setStock} />
      <AppText variant="label">Categoría AWS</AppText>
      {categories.loading ? <AppText>Cargando categorías…</AppText> : null}
      {categories.error ? <AppText accessibilityRole="alert">{categories.error}</AppText> : null}
      {!categories.loading && !categories.error && !categories.items.length ? <AppText>AWS no tiene categorías configuradas; solicita el seeding a backend.</AppText> : null}
      <AppButton label="Consultar categorías" variant="outline" loading={categories.loading} onPress={categories.reload} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {categories.items.map((item) => <FilterChip key={item.id} label={item.name} selected={item.id === categoryId} onPress={() => setCategoryId(item.id)} />)}
      </View>
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      <AppButton label="Vista previa local" variant="outline" onPress={showPreview} />
      {preview ? <Surface bordered style={{ gap: spacing.sm }}>
        <AppText variant="subtitle">Vista previa — no publicado</AppText>
        <AppText>{preview.name}</AppText><AppText>{preview.description}</AppText>
        <AppText>${(preview.cents / 100).toFixed(2)} MXN · Stock {preview.stock}</AppText>
        <AppText>Falta DTO de respuesta de productos. No se crea ni publica un recurso que no podamos validar.</AppText>
      </Surface> : null}
      <AppButton label="Publicar alimento" disabled />
    </View>
  </Screen>;
}
