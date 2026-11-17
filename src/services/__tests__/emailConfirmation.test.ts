import { createEmailConfirmation } from '../emailConfirmation';
import { PendingRegistrationStore, REGISTRATION_CONTEXT_MS } from '../pendingRegistration';
import { VerificationError } from '../supabase/verificationErrors';

jest.mock('../supabase/verificationClient', () => ({ verificationClient: { verify: jest.fn(), resend: jest.fn() } }));

function fixture() {
  let now = 100000;
  const clock = () => now;
  const store = new PendingRegistrationStore(clock);
  store.begin(' Fixture@UTTT.EDU.MX ');
  const id = store.read()!.id;
  const provider = { verify: jest.fn().mockResolvedValue(undefined), resend: jest.fn().mockResolvedValue(undefined) };
  return { store, provider, id, service: createEmailConfirmation(provider, store, clock), advance: (milliseconds: number) => { now += milliseconds; } };
}

describe('Contexto OTP efímero y exclusión mutua', () => {
  test('confirma solo tras proveedor, guarda correo normalizado y ningún OTP/token', async () => {
    const { service, provider, store, id } = fixture();
    await service.verify(id, '012345');
    expect(provider.verify).toHaveBeenCalledWith('fixture@uttt.edu.mx', '012345');
    expect(store.read()).toMatchObject({ email: 'fixture@uttt.edu.mx', verified: true, busy: false });
    expect(JSON.stringify(store.read())).not.toMatch(/012345|access_token|refresh_token/);
  });
  test('OTP inválido no llega al proveedor', async () => {
    const { service, provider, id } = fixture();
    await expect(service.verify(id, '12345')).rejects.toMatchObject({ kind: 'invalid_code' });
    expect(provider.verify).not.toHaveBeenCalled();
  });
  test('reenvío inicial espera60s y no permite repetición inmediata', async () => {
    const { service, provider, store, id, advance } = fixture();
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(provider.resend).not.toHaveBeenCalled();
    advance(60000);
    await service.resend(id);
    expect(provider.resend).toHaveBeenCalledWith('fixture@uttt.edu.mx');
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(provider.resend).toHaveBeenCalledTimes(1);
    expect(store.read()?.verified).toBe(false);
  });
  test('429 conserva deadline del servidor y bloquea también verificación', async () => {
    const { service, provider, id, advance } = fixture();
    advance(60000);
    provider.resend.mockRejectedValueOnce(new VerificationError('rate_limit', 180000));
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'rate_limit' });
    advance(179000);
    await expect(service.verify(id, '123456')).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(provider.verify).not.toHaveBeenCalled();
    advance(1000);
    await service.verify(id, '123456');
  });
  test('red no confirma ni reintenta automáticamente el reenvío', async () => {
    const { service, provider, store, id, advance } = fixture();
    advance(60000);
    provider.resend.mockRejectedValueOnce(new VerificationError('network'));
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'network' });
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'rate_limit' });
    expect(provider.resend).toHaveBeenCalledTimes(1);
    expect(store.read()).toMatchObject({ verified: false, busy: false });
  });
  test('dos instancias/pulsaciones comparten lock de verificación/reenvío', async () => {
    const { service, provider, store, id, advance } = fixture();
    advance(60000);
    let finish!: () => void;
    provider.verify.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const first = service.verify(id, '123456');
    await expect(service.verify(id, '123456')).rejects.toMatchObject({ kind: 'busy' });
    await expect(service.resend(id)).rejects.toMatchObject({ kind: 'busy' });
    expect(provider.verify).toHaveBeenCalledTimes(1);
    finish(); await first;
    expect(store.read()?.verified).toBe(true);
  });
  test('respuesta tardía no verifica otro registro más reciente', async () => {
    const { service, provider, store, id } = fixture();
    let finish!: () => void;
    provider.verify.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const first = service.verify(id, '123456');
    store.begin('new-fixture@uttt.edu.mx');
    finish();
    await expect(first).rejects.toMatchObject({ kind: 'registration_required' });
    expect(store.read()).toMatchObject({ email: 'new-fixture@uttt.edu.mx', verified: false, busy: false });
  });
  test('contexto caduca; ID o correo de URL no restablecen una sesión', async () => {
    const { service, provider, store, id, advance } = fixture();
    advance(REGISTRATION_CONTEXT_MS);
    await expect(service.verify(id, '123456')).rejects.toMatchObject({ kind: 'registration_required' });
    expect(store.getSnapshot()).toBeNull();
    expect(provider.verify).not.toHaveBeenCalled();
  });
  test('después de confirmar no se vuelve a verificar/reenviar', async () => {
    const { service, provider, id, advance } = fixture();
    await service.verify(id, '123456'); advance(60000);
    await service.verify(id, '123456'); await service.resend(id);
    expect(provider.verify).toHaveBeenCalledTimes(1);
    expect(provider.resend).not.toHaveBeenCalled();
  });
});
