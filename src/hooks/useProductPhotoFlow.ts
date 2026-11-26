import { useEffect, useRef, useState } from 'react';
import { selectProductPhoto, type LocalProductPhoto } from '@/services/productPhoto';
import { pr33Demo } from '@/services/pr33Demo';
import type { Pr33MediaSimulation, Pr33MediaStatus } from '@/services/api/mediaPr33Simulation';
import { isRealProductMediaEnabled, usesProductMediaDemo } from '@/config/productMedia';
import { useAuth } from '@/context/AuthContext';
import { photoUserMessage } from '@/utils/productPresentation';

export function useProductPhotoFlow() {
  const { productPhotoOperation } = useAuth();
  const [photo, setPhoto] = useState<LocalProductPhoto>();
  const [state, setState] = useState('Sin fotografía seleccionada');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<'selecting' | 'uploading' | 'reviewing'>('selecting');
  const [outcome, setOutcome] = useState<Pr33MediaStatus>('Approved');
  const [flow, setFlow] = useState<Pr33MediaSimulation>();
  const [realAsset, setRealAsset] = useState<{ mediaAssetId: string; status: Pr33MediaStatus }>();
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const pollStatus = async (initial: { mediaAssetId: string; status: Pr33MediaStatus }) => {
    let current = initial;
    for (let attempt = 0; attempt < 3 && ['PendingUpload', 'PendingModeration'].includes(current.status); attempt++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      if (!mounted.current) return;
      const next = await productPhotoOperation('status');
      if (!mounted.current) return;
      if (!next.success) throw new Error(next.error);
      current = next.data; setRealAsset(current); setState(current.status);
    }
  };
  const action = async (operation: () => Promise<void>, activity: 'selecting' | 'uploading' | 'reviewing' = 'selecting') => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setActivity(activity); setError(undefined);
    try { await operation(); }
    catch (cause) { setError(photoUserMessage(cause instanceof Error ? cause.message : '')); }
    finally { lock.current = false; setBusy(false); }
  };
  const choose = (source: 'camera' | 'gallery') => action(async () => {
    const selected = await selectProductPhoto(source);
    if (selected) { setPhoto(selected); setFlow(undefined); setRealAsset(undefined); setState('Fotografía seleccionada y validada'); }
  });
  const upload = () => action(async () => {
    if (!photo) return;
    if (!usesProductMediaDemo()) {
      if (!isRealProductMediaEnabled()) throw new Error('Las subidas reales no están habilitadas en esta ejecución.');
      setState('Preparando bytes y subiendo fotografía');
      const uploaded = await productPhotoOperation('upload', photo);
      if (!uploaded.success) throw new Error(uploaded.error);
      setRealAsset(uploaded.data); setState('Archivo subido; confirmando'); setActivity('reviewing');
      const confirmed = await productPhotoOperation('confirm');
      if (!confirmed.success) throw new Error(confirmed.error);
      setRealAsset(confirmed.data); setState(confirmed.data.status); await pollStatus(confirmed.data); return;
    }
    setState('Subida en preparación (demostración)');
    const pending = pr33Demo.photo(photo, outcome);
    setState('Subiendo (demostración, sin red)');
    const value = await pending; setFlow(value); setState('PendingModeration');
  }, 'uploading');
  const check = () => action(async () => {
    if (flow) setState(await flow.checkStatus());
    else if (isRealProductMediaEnabled() && realAsset) { const result = await productPhotoOperation('status'); if (!result.success) throw new Error(result.error); setRealAsset(result.data); setState(result.data.status); await pollStatus(result.data); }
  }, 'reviewing');
  const retry = () => action(async () => {
    if (flow) setState(await flow.retryConfirmation());
    else if (isRealProductMediaEnabled() && realAsset) { const result = await productPhotoOperation('confirm'); if (!result.success) throw new Error(result.error); setRealAsset(result.data); setState(result.data.status); await pollStatus(result.data); }
  }, 'reviewing');
  const reset = () => { if (lock.current) return; setPhoto(undefined); setFlow(undefined); setRealAsset(undefined); setError(undefined); setState('Sin fotografía seleccionada'); };
  const approvedMediaAssetId = usesProductMediaDemo() ? flow?.approvedAssetId() : realAsset?.status === 'Approved' && /^[a-f\d]{24}$/i.test(realAsset.mediaAssetId) ? realAsset.mediaAssetId : undefined;
  return { photo, state, error, busy, activity, outcome, setOutcome, flow, choose, upload, check, retry, reset, approvedMediaAssetId, uploaded: !!flow || !!realAsset };
}
