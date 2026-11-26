import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import type { OrderPr27, OrderStatus, OrderSummaryPr27 } from '@/services/api/orderContractsPr27';
import type { ApiPage } from '@/types/api';

export function useForeground() {
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  useEffect(() => { const listener = AppState.addEventListener('change', (state) => setActive(state === 'active')); return () => listener.remove(); }, []);
  return active;
}

export function useOrderList(seller = false, filter?: OrderStatus) {
  const auth = useAuth(), foreground = useForeground();
  const request = seller ? auth.listSellerOrders : auth.listBuyerOrders;
  const key = JSON.stringify([auth.user?.id, auth.status, seller, filter]);
  const sequence = useRef(0);
  const pending = useRef<{ page: number; epoch: number }>(undefined);
  const [snapshot, setSnapshot] = useState<{ key: string; data?: ApiPage<OrderSummaryPr27>; error?: string }>();
  const [busy, setBusy] = useState(false);
  const load = useCallback(async (page = 1) => {
    if (pending.current?.page === page && pending.current.epoch === sequence.current) return;
    const current = ++sequence.current; setBusy(true);
    pending.current = { page, epoch: current };
    try {
      const result = await (seller && filter ? request(page, filter) : request(page));
      if (current !== sequence.current) return;
      setSnapshot(result.success ? { key, data: result.data } : { key, error: result.error });
    } catch { if (current === sequence.current) setSnapshot({ key, error: 'No pudimos cargar los pedidos. Intenta de nuevo.' }); }
    finally { if (pending.current?.epoch === current) pending.current = undefined; if (current === sequence.current) setBusy(false); }
  }, [request, key, seller, filter]);
  useFocusEffect(useCallback(() => {
    void auth.orderRevision;
    if (foreground) void load(1); // Returning from a purchase ALWAYS starts at the newest page.
    return () => { ++sequence.current; };
  }, [load, auth.orderRevision, foreground]));
  const value = snapshot?.key === key ? snapshot : undefined;
  return { data: value?.data, error: value?.error, busy, load };
}

export function useOrderDetails(id: string | undefined, seller = false, poll = true) {
  const auth = useAuth(), foreground = useForeground();
  const request = seller ? auth.sellerOrder : auth.buyerOrder;
  const key = JSON.stringify([id, seller, auth.user?.id, auth.status]);
  const [revision, setRevision] = useState(0);
  const [focused, setFocused] = useState(false);
  const [snapshot, setSnapshot] = useState<{ key: string; order?: OrderPr27; error?: string; checkedAt: number }>();
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [expiredCheck, setExpiredCheck] = useState<number>();
  const readEpoch = useRef(0);
  const terminal = useRef<string>(undefined);
  const latest = useRef<{ key: string; order: OrderPr27 }>(undefined);
  useFocusEffect(useCallback(() => {
    void revision;
    let current = true, running = false, polls = 0;
    setFocused(true);
    const load = async (background = false) => {
      if (running || !foreground) return;
      if (!id || typeof id !== 'string') { setSnapshot({ key, error: 'No encontramos este pedido. Ábrelo desde tu lista.', checkedAt: 0 }); setBusy(false); return; }
      const epoch = readEpoch.current;
      running = true; if (!background) setBusy(true);
      try {
        const result = await request(id);
        if (current && epoch === readEpoch.current) {
          const known = latest.current?.key === key ? latest.current.order : undefined;
          if (!result.success) {
            setSnapshot({ key, error: result.error, checkedAt: 0 }); setFresh(false);
          } else if (known && result.data.version < known.version) {
            // Preserve the latest confirmed detail, but never extend QR freshness from an old read.
            setFresh(false);
          } else {
            const { data } = result;
            const order = known && known.version === data.version && known.status === data.status && known.updatedAt === data.updatedAt ? known : data;
            latest.current = { key, order };
            if (['Delivered', 'Rejected', 'CancelledByBuyer'].includes(order.status)) terminal.current = key;
            setSnapshot({ key, order, checkedAt: Date.now() }); setFresh(true);
          }
        }
      } catch { if (current && epoch === readEpoch.current) { setSnapshot({ key, error: 'No pudimos consultar el pedido. Actualiza para intentarlo de nuevo.', checkedAt: 0 }); setFresh(false); } }
      finally { running = false; if (current && epoch === readEpoch.current && !background) setBusy(false); }
    };
    void load();
    // Eight reads maximum while focused, never a background or endless polling loop.
    const timer = poll && foreground ? setInterval(() => { if (++polls <= 8 && terminal.current !== key) void load(true); else clearInterval(timer); }, 15000) : undefined;
    return () => { current = false; clearInterval(timer); setFocused(false); setFresh(false); };
  }, [request, id, key, revision, foreground, poll]));
  const value = snapshot?.key === key ? snapshot : undefined;
  useEffect(() => {
    if (!value?.checkedAt) return;
    const timer = setTimeout(() => setExpiredCheck(value.checkedAt), Math.max(0, value.checkedAt + 30000 - Date.now()));
    return () => clearTimeout(timer);
  }, [value]);
  const refresh = () => { ++readEpoch.current; setBusy(true); setFresh(false); setRevision((n) => n + 1); };
  const applyVerified = (order: OrderPr27) => {
    if (order.orderId !== id || (latest.current?.key === key && latest.current.order.version > order.version)) return;
    if (['Delivered', 'Rejected', 'CancelledByBuyer'].includes(order.status)) terminal.current = key;
    ++readEpoch.current;
    const checkedAt = Date.now();
    latest.current = { key, order };
    setSnapshot({ key, order, checkedAt });
    setFresh(true); setBusy(false);
  };
  return { order: value?.order, error: value?.error, busy, active: focused && foreground && fresh && !!value?.order && expiredCheck !== value.checkedAt, refresh, applyVerified };
}
