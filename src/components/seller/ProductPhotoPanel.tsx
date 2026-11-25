import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppText, Surface } from '@/components/ui';
import { FilterChip } from '@/components/catalog/FilterChip';
import { isRealProductMediaEnabled, usesProductMediaDemo } from '@/config/productMedia';
import type { useProductPhotoFlow } from '@/hooks/useProductPhotoFlow';
import { colors, radii, spacing } from '@/theme';
import { photoStatusLabels } from '@/utils/productPresentation';
import { MotionFeedback } from '@/components/ui/MotionFeedback';

export function ProductPhotoPanel({ photo, disabled = false }: { photo: ReturnType<typeof useProductPhotoFlow>; disabled?: boolean }) {
  const demo = usesProductMediaDemo();
  const enabled = demo || isRealProductMediaEnabled();
  const ready = !!photo.approvedMediaAssetId;
  const status = photo.busy ? photo.activity === 'selecting' ? 'Abriendo fotografía…' : photo.activity === 'uploading' ? 'Subiendo fotografía…' : 'Revisando fotografía…' :
    ready ? photoStatusLabels.Approved : photo.state === 'Approved' ? 'No pudimos confirmar la fotografía. Consulta de nuevo antes de publicar.' : photoStatusLabels[photo.state as keyof typeof photoStatusLabels] ?? (photo.uploaded ? 'Revisando fotografía…' : 'Sube la fotografía antes de publicar.');
  const rejected = photo.state === 'Rejected' || photo.state === 'ProcessingFailed';
  return <View style={{ gap: spacing.sm }}>
    {photo.photo ? <Image source={{ uri: photo.photo.uri }} accessibilityLabel="Vista previa de fotografía" resizeMode="cover" style={styles.preview} /> :
      <View style={styles.placeholder}><Ionicons name="image-outline" size={28} color={colors.primary} /><AppText variant="label" color={colors.primary}>Agregar foto (opcional)</AppText></View>}
    <AppText variant="caption" color={colors.textMuted}>JPEG, PNG o WebP · Hasta 4 MB</AppText>
    <View style={styles.actions}>
      <AppButton label={photo.photo ? 'Cambiar con cámara' : 'Tomar fotografía'} icon="camera-outline" size="md" variant="outline" style={styles.action} disabled={disabled || photo.busy} onPress={() => void photo.choose('camera')} />
      <AppButton label={photo.photo ? 'Cambiar desde galería' : 'Elegir de galería'} icon="images-outline" size="md" variant="outline" style={styles.action} disabled={disabled || photo.busy} onPress={() => void photo.choose('gallery')} />
    </View>
    {photo.photo ? <>
      <AppButton label="Quitar fotografía" icon="trash-outline" variant="ghost" size="sm" disabled={disabled || photo.busy} onPress={photo.reset} />
      {!enabled ? <AppText variant="caption">No puedes subir fotografías en este momento. Puedes publicar sin fotografía.</AppText> : <>
        {!photo.error ? <MotionFeedback trigger={status}><View style={styles.status}>
          {photo.busy ? <ActivityIndicator size="small" color={colors.primary} /> : ready ? <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} /> : null}
          <AppText variant="caption" color={rejected ? colors.danger : ready ? colors.success : colors.textMuted} accessibilityRole={rejected ? 'alert' : undefined} accessibilityLiveRegion="polite" style={{ flex: 1 }}>{status}</AppText>
        </View></MotionFeedback> : null}
        {!photo.uploaded ? <AppButton label="Subir fotografía" icon="cloud-upload-outline" size="md" loading={photo.busy && photo.activity === 'uploading'} disabled={disabled || photo.busy} onPress={() => void photo.upload()} /> : null}
        {photo.uploaded && !ready ? <>
          <AppButton label="Consultar fotografía" size="md" variant="outline" disabled={disabled || photo.busy} onPress={() => void photo.check()} />
          {photo.error ? <AppButton label="Reintentar revisión" size="md" variant="outline" disabled={disabled || photo.busy} onPress={() => void photo.retry()} /> : null}
        </> : null}
      </>}
    </> : null}
    {photo.error ? <Surface style={{ backgroundColor: colors.dangerSoft }}><AppText accessibilityRole="alert" color={colors.danger}>{photo.error}</AppText></Surface> : null}
    {demo && photo.photo ? <>
      <AppText variant="caption">Demostración · Resultado de la revisión</AppText>
      <View style={styles.actions}>{(['Approved', 'Rejected', 'ProcessingFailed', 'PendingModeration', 'PendingUpload'] as const).map((value) => <FilterChip key={value} label={{ ...photoStatusLabels, PendingUpload: 'En espera de revisión' }[value]} selected={photo.outcome === value} onPress={() => { if (!photo.busy && !photo.flow) photo.setOutcome(value); }} />)}</View>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  preview: { width: '100%', aspectRatio: 1.6, borderRadius: radii.lg },
  placeholder: { minHeight: 120, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flex: 1, minWidth: 130 },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
