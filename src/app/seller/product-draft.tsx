import React, { useRef, useState } from 'react';
import { Image, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { emptyProductForm, validateProductForm, type ProductFormErrors } from '@/utils/productForm';
import { useCatalogCategories } from '@/hooks/useCatalogCategories';
import { FilterChip } from '@/components/catalog/FilterChip';
import { errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import type { ProductResponse } from '@/types/api';
import { AwsProductImage } from '@/components/catalog/AwsProductImage';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { MotionFeedback } from '@/components/ui/MotionFeedback';
import { selectProductPhoto, type LocalProductPhoto } from '@/services/productPhoto';

export default function ProductDraftScreen() { return <SellerEntry authorizedChildren={<ProductDraftContent />} />; }
function ProductDraftContent() {
  const { createProduct, role } = useAuth();
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
  const categories = useCatalogCategories(false);
  const [preview, setPreview] = useState<{ name: string; description: string; cents: number; stock: number }>();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});
  const [photo, setPhoto] = useState<LocalProductPhoto>();
  const [photoError, setPhotoError] = useState<string>();
  const [selectingPhoto, setSelectingPhoto] = useState(false);
  const photoLock = useRef(false);
  const choosePhoto = async (source: 'camera' | 'gallery') => {
    if (photoLock.current || busy) return;
    photoLock.current = true; setSelectingPhoto(true); setPhotoError(undefined);
    try { const selected = await selectProductPhoto(source); if (selected) setPhoto(selected); }
    catch (cause) { setPhotoError(cause instanceof Error ? cause.message : 'No se pudo seleccionar la fotografía.'); }
    finally { photoLock.current = false; setSelectingPhoto(false); }
  };
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
    if (publishing.current || published || photo || selectingPhoto) return;
    publishing.current = true; setBusy(true); setError(undefined);
    try {
      const input = body();
      if (!input) return;
      const result = await createProduct(input);
      if (result.success) setPublished(result.data);
      else setError(result.error);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { publishing.current = false; setBusy(false); }
  };
  const createAnother = () => {
    setName(emptyProductForm.name); setDescription(emptyProductForm.description); setPrice(emptyProductForm.price);
    setIngredients(emptyProductForm.ingredients); setStock(emptyProductForm.stock); setCategoryId(emptyProductForm.categoryId);
    setPreview(undefined); setError(undefined); setFieldErrors({}); setPublished(undefined); setPhoto(undefined); setPhotoError(undefined);
    requestAnimationFrame(() => nameInput.current?.focus());
  };
  return <Screen scroll constrained header={<AppHeader title="Agregar alimento" backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Revisa los datos antes de publicar. AWS verifica tu sesión Seller y negocio activo.</AppText>
      <AppText variant="caption">Media pendiente de integración: la fotografía seleccionada solo se muestra en este dispositivo.</AppText>
      {published ? <MotionFeedback trigger={published.id}><Surface bordered style={{ gap: spacing.md }}>
        <AppText variant="subtitle" accessibilityLiveRegion="polite">Alimento publicado</AppText>
        <AppText>Producto recibido por AWS: {published.id} · {published.status}</AppText>
        <AppButton label="Crear otro alimento" onPress={createAnother} />
        <AppButton label="Ver mis alimentos" variant="outline" onPress={() => router.push('/seller/products')} />
      </Surface></MotionFeedback> : null}
      {!published ? <>
      <Surface bordered style={{ gap: spacing.md }}>
        {photo ? <Image source={{ uri: photo.uri }} accessibilityLabel="Vista previa de fotografía local" resizeMode="cover" style={{ width: '100%', aspectRatio: 1.6 }} onError={() => { setPhoto(undefined); setPhotoError('No se pudo mostrar la fotografía. Selecciona otra.'); }} /> : <AppText>Agregar foto (opcional)</AppText>}
        {photo ? <AppText>Fotografía local seleccionada. La publicación con imagen aún no está disponible; quítala para publicar sin foto.</AppText> : null}
        {photoError ? <AppText accessibilityRole="alert">{photoError}</AppText> : null}
        <AppButton label={photo ? 'Cambiar con cámara' : 'Tomar fotografía'} variant="outline" loading={selectingPhoto} disabled={busy || selectingPhoto} onPress={() => void choosePhoto('camera')} />
        <AppButton label={photo ? 'Cambiar desde galería' : 'Elegir de galería'} variant="outline" disabled={busy || selectingPhoto} onPress={() => void choosePhoto('gallery')} />
        {photo ? <AppButton label="Quitar fotografía" variant="outline" disabled={busy || selectingPhoto} onPress={() => { setPhoto(undefined); setPhotoError(undefined); }} /> : null}
      </Surface>
      <AppInput ref={nameInput} label="Nombre" accessibilityLabel="Nombre del alimento" value={name} onChangeText={setName} editable={!busy && !published} error={fieldErrors.name} helper={`${[...name].length}/100`} placeholder="Nombre del alimento" />
      <AppInput label="Descripción" accessibilityLabel="Descripción del alimento" value={description} onChangeText={setDescription} editable={!busy && !published} error={fieldErrors.description} helper={`${[...description].length}/500`} multiline placeholder="Descripción del alimento" />
      <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" keyboardType="decimal-pad" value={price} onChangeText={setPrice} editable={!busy && !published} error={fieldErrors.price} placeholder="0.00" />
      <AppInput label="Ingredientes (separados por coma)" accessibilityLabel="Ingredientes" value={ingredients} onChangeText={setIngredients} editable={!busy && !published} error={fieldErrors.ingredients} />
      <AppInput label="Stock" accessibilityLabel="Stock" keyboardType="number-pad" value={stock} onChangeText={setStock} editable={!busy && !published} error={fieldErrors.stock} />
      <AppText variant="label">Categoría AWS</AppText>
      {categories.loading ? <AppText>Cargando categorías…</AppText> : null}
      {categories.error ? <AppText accessibilityRole="alert">{categories.error}</AppText> : null}
      {!categories.loading && !categories.error && !categories.items.length ? <AppText>AWS no tiene categorías configuradas; solicita el seeding a backend.</AppText> : null}
      <AppButton label="Consultar categorías" variant="outline" loading={categories.loading} onPress={categories.reload} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {categories.items.map((item) => <FilterChip key={item.id} label={item.name} selected={item.id === categoryId} onPress={() => { if (!busy && !published) setCategoryId(item.id); }} />)}
      </View>
      {fieldErrors.categoryId ? <AppText accessibilityRole="alert">{fieldErrors.categoryId}</AppText> : null}
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      <AppButton label="Vista previa local" variant="outline" onPress={showPreview} />
      {preview ? <Surface bordered style={{ gap: spacing.sm }}>
        <AppText variant="subtitle">Vista previa — no publicado</AppText>
        {photo ? <><Image source={{ uri: photo.uri }} accessibilityLabel="Fotografía local en vista previa" resizeMode="cover" style={{ width: '100%', aspectRatio: 1.6 }} />
          <AppText variant="caption">Fotografía solo local; todavía no se ha subido a AWS.</AppText></> : <AwsProductImage uri={null} name={preview.name} />}
        <AppText>{preview.name}</AppText><AppText>{preview.description}</AppText>
        <AppText>${(preview.cents / 100).toFixed(2)} MXN · Stock {preview.stock}</AppText>
        <AppText>La vista previa no crea el producto. Publicar envía los campos confirmados a AWS.</AppText>
      </Surface> : null}
      {error && !published ? <><AppText>Si el resultado no pudo confirmarse, revisa tus alimentos antes de volver a publicar.</AppText>
        <AppButton label="Revisar mis alimentos" variant="outline" disabled={busy} onPress={() => router.push('/seller/products')} /></> : null}
      {role !== 'seller' ? <AppText>Se requiere rol Seller validado. Consulta tu negocio o vuelve a iniciar sesión tras activarlo.</AppText> : null}
      <AppButton label="Publicar alimento" loading={busy} disabled={role !== 'seller' || !!published || !!photo || selectingPhoto || !categories.items.length || categories.loading} onPress={() => void publish()} />
      </> : null}
    </View>
  </Screen>;
}
