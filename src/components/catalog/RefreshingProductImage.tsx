import React, { useEffect, useRef, useState } from 'react';
import { AwsProductImage } from './AwsProductImage';
import { productService } from '@/services/api/productService';
import type { ProductResponse } from '@/types/api';
import { recordMediaFailure } from '@/services/api/mediaDiagnostics';
import type { StyleProp, ViewStyle } from 'react-native';
import { radii } from '@/theme';

/** One renewal per mounted product. Never POST, never log/store the signed URL. */
export function RefreshingProductImage({ product, style }: { product: ProductResponse; style?: StyleProp<ViewStyle> }) {
  const [renewed, setRenewed] = useState<ProductResponse>();
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const attempted = useRef(false);
  const value = renewed ?? product;
  const expiry = value.imageUrlExpiresAt ? Date.parse(value.imageUrlExpiresAt) : Infinity;
  const stale = !!value.imageUrl && (expired || expiry <= clock);
  useEffect(() => {
    if (!Number.isFinite(expiry) || !value.imageUrl) return;
    const remaining = expiry - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setExpired(true), Math.min(remaining, 2147483647));
    return () => clearTimeout(timer);
  }, [expiry, value.imageUrl]);
  useEffect(() => {
    if ((!stale && !failed) || attempted.current) return;
    attempted.current = true; let current = true;
    void productService.getById(product.id, 'product-image-renewal').then((updated) => { if (current) { setRenewed(updated); setClock(Date.now()); setFailed(false); setExpired(false); } })
      .catch(() => { /* Remain on placeholder; caller can refresh the screen explicitly. */ });
    return () => { current = false; };
  }, [stale, failed, product.id]);
  return <AwsProductImage key={renewed ? 'renewed' : 'initial'} style={[{ borderRadius: radii.lg }, style]} uri={stale || failed ? null : value.imageUrl ?? null} name={value.name} onFailure={() => { recordMediaFailure('read-image', 'GET', 'ProductImage', undefined); setFailed(true); }} />;
}
