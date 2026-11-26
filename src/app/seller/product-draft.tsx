import React, { useRef, useState } from 'react';
import { Image, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { emptyProductForm, validateProductForm, type ProductFormErrors } from '@/utils/productForm';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { FilterChip } from '@/components/catalog/FilterChip';
import { errorMessage } from '@/services/api/errors';
import { colors, radii, spacing } from '@/theme';
import { productUserMessage } from '@/utils/productPresentation';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse } from '@/types/api';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { isRealProductMediaEnabled, usesProductMediaDemo } from '@/config/productMedia';
import { pr33Demo, demoCategories } from '@/services/pr33Demo';
import { useProductPhotoFlow } from '@/hooks/useProductPhotoFlow';
import { ProductPhotoPanel } from '@/components/seller/ProductPhotoPanel';
import type { Pr33CatalogSimulation } from '@/services/api/catalogPr33Simulation';

export default function ProductDraftScreen() { return usesProductMediaDemo() ? <ProductDraftContent /> : <SellerEntry authorizedChildren={<ProductDraftContent />} />; }
function ProductDraftContent() {
  const { createProduct, role } = useAuth();
  const demo = usesProductMediaDemo();
  const realEnabled = isRealProductMediaEnabled();
  const photoFlow = useProductPhotoFlow();
  const photo = photoFlow.photo;
  const catalogAttempt = useRef<Pr33CatalogSimulation | null>(null);
  const router = useRouter();
  const nameInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const publishing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<ProductResponse>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const liveCategories = useCatalogCategories(false, !demo);
  const categories = demo ? { items: demoCategories, loading: false, error: undefined, reload: () => undefined } : liveCategories;
  const [preview, setPreview] = useState<{ name: string; description: string; cents: number; stock: number }>();
  const [error, setError] = useState<string>();
  const [uncertain, setUncertain] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});
  const body = () => {
    const result = validateProductForm({ name, description, price, stock, categoryId, ingredients }, categories.items.map((item) => item.id));
    setFieldErrors(result.errors);
    return result.body;
  };
  const showPreview = () => {
    setError(undefined); setPreview(undefined);
    try {
      const value = body();
      if (!value) return;
      setPreview({ name: value.name, description: value.description, cents: Math.round(value.price * 100), stock: value.stock });
    }
    catch (cause) { setError(errorMessage(cause)); }
  };
  const publish = async () => {
    if (publishing.current || published || uncertain || photoFlow.busy || (photo && ((!demo && !realEnabled) || !photoFlow.approvedMediaAssetId))) return;
    publishing.current = true; setBusy(true); setError(undefined);
    try {
      const input = body();
      if (!input) return;
      if (demo && !catalogAttempt.current) catalogAttempt.current = pr33Demo.catalog();
      const result = demo ? { success: true as const, data: await pr33Demo.create(input, photo ? photoFlow.flow : undefined, catalogAttempt.current ?? undefined) } : await createProduct({ ...input, ...(photo && photoFlow.approvedMediaAssetId ? { mediaAssetId: photoFlow.approvedMediaAssetId } : {}) });
      if (result.success) setPublished(result.data);
      else { setError(result.error); if (result.reason === 'uncertain') setUncertain(true); }
    } catch (cause) { setError(errorMessage(cause)); }
    finally { publishing.current = false; setBusy(false); }
  };
  const createAnother = () => {
    setName(emptyProductForm.name); setDescription(emptyProductForm.description); setPrice(emptyProductForm.price);
    setIngredients(emptyProductForm.ingredients); setStock(emptyProductForm.stock); setCategoryId(emptyProductForm.categoryId);
    setPreview(undefined); setError(undefined); setFieldErrors({}); setPublished(undefined); photoFlow.reset(); catalogAttempt.current = null;
    requestAnimationFrame(() => nameInput.current?.focus());
  };
  return <Screen scroll constrained header={<AppHeader title="Agregar alimento" backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      {demo ? <AppText variant="caption">Demostración · Los alimentos no se publicarán.</AppText> : null}
      {published ? <MotionFeedback trigger={published.id}><Surface bordered style={{ gap: spacing.md }}>
        <AppText variant="subtitle" color={colors.success} accessibilityLiveRegion="polite">{demo ? 'Alimento guardado solo en demostración' : '¡Alimento publicado!'}</AppText>
        <AppButton label="Crear otro alimento" onPress={createAnother} />
        <AppButton label="Ver mis alimentos" variant="outline" onPress={() => router.dismissTo('/seller/products')} />
      </Surface></MotionFeedback> : null}
      {!published ? <>
      <ProductPhotoPanel photo={photoFlow} disabled={busy} />
      <AppInput ref={nameInput} label="Nombre" accessibilityLabel="Nombre del alimento" value={name} onChangeText={setName} editable={!busy && !published} error={fieldErrors.name} helper={`${[...name].length}/100`} placeholder="Nombre del alimento" />
      <AppInput label="Descripción" accessibilityLabel="Descripción del alimento" value={description} onChangeText={setDescription} editable={!busy && !published} error={fieldErrors.description} helper={`${[...description].length}/500`} multiline placeholder="Descripción del alimento" />
      <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" keyboardType="decimal-pad" value={price} onChangeText={setPrice} editable={!busy && !published} error={fieldErrors.price} placeholder="0.00" />
      <AppInput label="Ingredientes (separados por coma)" accessibilityLabel="Ingredientes" value={ingredients} onChangeText={setIngredients} editable={!busy && !published} error={fieldErrors.ingredients} />
      <AppInput label="Stock" accessibilityLabel="Stock" keyboardType="number-pad" value={stock} onChangeText={setStock} editable={!busy && !published} error={fieldErrors.stock} />
      <AppText variant="label">Categoría</AppText>
      {categories.loading ? <AppText>Cargando categorías…</AppText> : null}
      {categories.error ? <AppText accessibilityRole="alert">{productUserMessage(categories.error)}</AppText> : null}
      {!categories.loading && !categories.error && !categories.items.length ? <AppText>No hay categorías disponibles. Intenta de nuevo más tarde.</AppText> : null}
      <AppButton label="Consultar categorías" variant="outline" loading={categories.loading} onPress={categories.reload} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {categories.items.map((item) => <FilterChip key={item.id} label={item.name} selected={item.id === categoryId} onPress={() => { if (!busy && !published) setCategoryId(item.id); }} />)}
      </View>
      {fieldErrors.categoryId ? <AppText accessibilityRole="alert">{fieldErrors.categoryId}</AppText> : null}
      {error || uncertain ? <AppText accessibilityRole="alert" color={colors.danger}>{uncertain ? 'No pudimos confirmar la publicación. Conservamos tus datos y fotografía. Revisa tus alimentos antes de volver a publicar; si no aparece, contacta a soporte.' : productUserMessage(error!)}</AppText> : null}
      <AppButton label="Vista previa" variant="outline" onPress={showPreview} />
      {preview ? <Surface bordered style={{ gap: spacing.sm }}>
        <AppText variant="subtitle">Así se verá tu alimento</AppText>
        {photo ? <Image source={{ uri: photo.uri }} accessibilityLabel="Fotografía del alimento en vista previa" resizeMode="cover" style={{ width: '100%', aspectRatio: 1.6, borderRadius: radii.lg }} /> : <AwsProductImage uri={null} name={preview.name} />}
        <AppText>{preview.name}</AppText><AppText>{preview.description}</AppText>
        <AppText>${(preview.cents / 100).toFixed(2)} MXN · Stock {preview.stock}</AppText>
        <AppText variant="caption" color={colors.textMuted}>Vista previa · Todavía no publicado</AppText>
      </Surface> : null}
      {error && !published ? <AppButton label="Revisar mis alimentos" variant="outline" disabled={busy} onPress={() => router.push('/seller/products')} /> : null}
      {!demo && role !== 'seller' ? <AppText>Necesitas una cuenta de vendedor activa. Revisa tu negocio o vuelve a iniciar sesión.</AppText> : null}
      {busy ? <AppText accessibilityLiveRegion="polite">Publicando alimento…</AppText> : null}
      <AppButton label="Publicar alimento" loading={busy} disabled={(!demo && role !== 'seller') || !!published || uncertain || (!!photo && ((!demo && !realEnabled) || !photoFlow.approvedMediaAssetId)) || photoFlow.busy || !categories.items.length || categories.loading} onPress={() => void publish()} />
      </> : null}
    </View>
  </Screen>;
}
