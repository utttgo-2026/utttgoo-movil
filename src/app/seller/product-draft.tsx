import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { priceInCents } from '@/utils/sellerValidation';
import { createProductBody } from '@/services/api/productService';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { FilterChip } from '@/components/catalog/FilterChip';
import { ApiError, errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse } from '@/types/api';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';
import { SellerEntry } from '@/components/seller/SellerEntry';

export default function ProductDraftScreen() { return <SellerEntry authorizedChildren={<ProductDraftContent />} />; }
function ProductDraftContent() {
  const { createProduct, role } = useAuth();
  const publishing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<ProductResponse>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const categories = useCatalogCategories(false);
  const [preview, setPreview] = useState<{ name: string; description: string; cents: number; stock: number }>();
  const [error, setError] = useState<string>();
  const body = () => {
    if (!/^\d+$/.test(stock)) throw new ApiError('validation', 'Stock debe ser entero no negativo.');
    return createProductBody({ name, description, price: priceInCents(price) / 100, stock: Number(stock), categoryId,
      ingredients: ingredients.split(',').map((value) => value.trim()).filter(Boolean) }, categories.items.map((item) => item.id));
  };
  const showPreview = () => {
    setError(undefined); setPreview(undefined);
    try {
      const value = body();
      setPreview({ name: value.name, description: value.description, cents: Math.round(value.price * 100), stock: value.stock });
    }
    catch (cause) { setError(errorMessage(cause)); }
  };
  const publish = async () => {
    if (publishing.current || published) return;
    publishing.current = true; setBusy(true); setError(undefined);
    try {
      const result = await createProduct(body());
      if (result.success) setPublished(result.data);
      else setError(result.error);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { publishing.current = false; setBusy(false); }
  };
  return <Screen scroll constrained header={<AppHeader title="Agregar alimento" backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Revisa los datos antes de publicar. AWS verifica tu sesión Seller y negocio activo.</AppText>
      <AppText variant="caption">Media pendiente de la Fase 05: se publica sin imagen. La vista previa es local.</AppText>
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
        <AwsProductImage uri={null} name={preview.name} />
        <AppText>{preview.name}</AppText><AppText>{preview.description}</AppText>
        <AppText>${(preview.cents / 100).toFixed(2)} MXN · Stock {preview.stock}</AppText>
        <AppText>La vista previa no crea el producto. Publicar envía los campos confirmados a AWS.</AppText>
      </Surface> : null}
      {published ? <Surface bordered><AppText accessibilityLiveRegion="polite">Producto recibido por AWS: {published.id} · {published.status}</AppText></Surface> : null}
      {role !== 'seller' ? <AppText>Se requiere rol Seller validado. Consulta tu negocio o vuelve a iniciar sesión tras activarlo.</AppText> : null}
      <AppButton label="Publicar alimento" loading={busy} disabled={role !== 'seller' || !!published || !categories.items.length || categories.loading} onPress={() => void publish()} />
    </View>
  </Screen>;
}
