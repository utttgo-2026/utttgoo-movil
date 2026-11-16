import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { AppButton, AppHeader, AppInput, AppText, Screen, Surface } from '@/components';
import { priceInCents, sellerText } from '@/utils/sellerValidation';
import { errorMessage } from '@/services/api/errors';
import { spacing } from '@/theme';

export default function ProductDraftScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [soldOut, setSoldOut] = useState(false);
  const [preview, setPreview] = useState<{ name: string; description: string; cents: number; soldOut: boolean }>();
  const [error, setError] = useState<string>();
  const showPreview = () => {
    setError(undefined); setPreview(undefined);
    try { setPreview({ name: sellerText(name, 2, 100), description: sellerText(description, 10, 1000), cents: priceInCents(price), soldOut }); }
    catch (cause) { setError(errorMessage(cause)); }
  };
  return <Screen scroll constrained header={<AppHeader title="Agregar alimento" backFallback="/seller/products" />}>
    <View style={{ gap: spacing.lg, paddingVertical: spacing.lg }}>
      <AppText>Preparación local, no publicada. Los campos se pierden al salir; no se envían a AWS ni al catálogo comprador.</AppText>
      <AppButton label="Agregar foto" variant="outline" disabled />
      <AppText variant="caption">Selección/subida y validación binaria de imagen pendientes del contrato. La validación de metadatos está preparada, no acredita contenido real.</AppText>
      <AppInput label="Nombre" accessibilityLabel="Nombre del alimento" value={name} onChangeText={setName} placeholder="Nombre del alimento" />
      <AppInput label="Descripción" accessibilityLabel="Descripción del alimento" value={description} onChangeText={setDescription} multiline placeholder="Descripción del alimento" />
      <AppInput label="Precio MXN" accessibilityLabel="Precio MXN" keyboardType="decimal-pad" value={price} onChangeText={setPrice} placeholder="0.00" />
      <AppInput label="Categoría" value="" editable={false} placeholder="Pendiente de categorías reales AWS" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md }}>
        <AppText>Marcar como agotado (vista previa)</AppText><Switch accessibilityLabel="Agotado en vista previa" value={soldOut} onValueChange={setSoldOut} />
      </View>
      {error ? <AppText accessibilityRole="alert">{error}</AppText> : null}
      <AppButton label="Vista previa local" variant="outline" onPress={showPreview} />
      {preview ? <Surface bordered style={{ gap: spacing.sm }}>
        <AppText variant="subtitle">Vista previa — no publicado</AppText>
        <AppText>{preview.name}</AppText><AppText>{preview.description}</AppText>
        <AppText>${(preview.cents / 100).toFixed(2)} MXN · {preview.soldOut ? 'Agotado' : 'Disponible (borrador)'}</AppText>
        <AppText>Faltan categoría/imagen reales, autorización y contrato de publicación.</AppText>
      </Surface> : null}
      <AppButton label="Publicar alimento" disabled />
    </View>
  </Screen>;
}
