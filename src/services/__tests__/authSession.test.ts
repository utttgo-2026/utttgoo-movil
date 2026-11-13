import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/models';

import { ApiError } from '../api/errors';
import type { SessionContract } from '../api/sessionContract';
import { AuthSession } from '../authSession';

jest.mock('../sessionStorage', () => ({ sessionStorage: {} }));

// Fixtures sintéticos para probar el coordinador, NO representan el contrato de AWS.
const user: User = { id: 'fixture-user', role: 'buyer', fullName: 'Fixture', email: 'fixture@uttt.edu.mx' };
const response = (data: unknown, status = 200): ApiResponse => ({ data, status, headers: {} });
const contract: SessionContract = {
  decodeLogin: (data) => {
    if (data !== 'synthetic-login') throw new ApiError('invalid_response', 'Fixture inválido');
    return 'synthetic.jwt';
  },
  decodeIdentity: (data) => {
    if (data !== 'synthetic-identity') throw new ApiError('invalid_response', 'Fixture inválido');
    return user;
  },
  decodeProfile: (data) => {
    if (data !== 'synthetic-profile') throw new ApiError('invalid_response', 'Fixture inválido');
    return user;
  },
};

function fixture() {
  const deps = {
    storage: { read: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue(undefined), clear: jest.fn().mockResolvedValue(undefined) },
    auth: {
      login: jest.fn().mockResolvedValue(response('synthetic-login')),
      register: jest.fn().mockResolvedValue(response(null, 202)),
      getMe: jest.fn().mockResolvedValue(response('synthetic-identity')),
    },
    users: { getMe: jest.fn().mockResolvedValue(response('synthetic-profile')), updateMe: jest.fn().mockResolvedValue(response(null)) },
    contract: contract as SessionContract | null,
    assertSecureTransport: jest.fn(),
  };
  return { deps, session: new AuthSession(deps) };
}

describe('Coordinador de sesión única', () => {
  test('sin token no hay usuario ni petición autenticada', async () => {
    const { deps, session } = fixture();
    expect(await session.restore()).toBeNull();
    expect(deps.auth.getMe).not.toHaveBeenCalled();
  });

  test('sin contrato login falla cerrado sin transmitir credenciales', async () => {
    const { deps, session } = fixture();
    deps.contract = null;
    await expect(session.login(user.email, 'synthetic-password')).rejects.toMatchObject({ kind: 'contract_unavailable' });
    expect(deps.auth.login).not.toHaveBeenCalled();
    expect(deps.storage.save).not.toHaveBeenCalled();
  });

  test('HTTP bloquea login/registro y restauración antes de llamadas autenticadas', async () => {
    const { deps, session } = fixture();
    deps.assertSecureTransport.mockImplementation(() => { throw new ApiError('insecure_transport', 'HTTPS requerido'); });
    deps.storage.read.mockResolvedValue('synthetic.jwt');
    await expect(session.login(user.email, 'synthetic-password')).rejects.toMatchObject({ kind: 'insecure_transport' });
    await expect(session.register('Fixture', user.email, 'synthetic-password')).rejects.toMatchObject({ kind: 'insecure_transport' });
    await expect(session.restore()).rejects.toMatchObject({ kind: 'insecure_transport' });
    expect(deps.auth.login).not.toHaveBeenCalled();
    expect(deps.auth.register).not.toHaveBeenCalled();
    expect(deps.auth.getMe).not.toHaveBeenCalled();
    expect(deps.storage.clear).not.toHaveBeenCalled();
  });

  test('valida identidad y perfil antes de guardar únicamente JWT', async () => {
    const { deps, session } = fixture();
    expect(await session.login(user.email, 'synthetic-password')).toEqual(user);
    expect(deps.auth.getMe).toHaveBeenCalledWith('synthetic.jwt');
    expect(deps.users.getMe).toHaveBeenCalledWith('synthetic.jwt');
    expect(deps.storage.save).toHaveBeenCalledWith('synthetic.jwt');
    expect(deps.storage.save.mock.calls[0]).not.toContain('synthetic-password');
  });

  test('token/identidad no decodificables no crean sesión', async () => {
    const { deps, session } = fixture();
    deps.auth.login.mockResolvedValueOnce(response({ unexpected: 'fixture' }));
    await expect(session.login(user.email, 'synthetic-password')).rejects.toMatchObject({ kind: 'invalid_response' });
    expect(deps.storage.save).not.toHaveBeenCalled();
  });

  test('rechazo del servidor no activa usuario demo', async () => {
    const { deps, session } = fixture();
    deps.auth.login.mockRejectedValue(new ApiError('http', 'Unauthorized', 401));
    await expect(session.login(user.email, 'synthetic-password')).rejects.toMatchObject({ status: 401 });
    expect(deps.storage.save).not.toHaveBeenCalled();
  });

  test('restauración necesita ambas respuestas remotas', async () => {
    const { deps, session } = fixture();
    deps.storage.read.mockResolvedValue('synthetic.jwt');
    expect(await session.restore()).toEqual(user);
    expect(deps.auth.getMe).toHaveBeenCalledTimes(1);
    expect(deps.users.getMe).toHaveBeenCalledTimes(1);
  });

  test.each(['network', 'timeout'] as const)('%s no borra el token persistido', async (kind) => {
    const { deps, session } = fixture();
    deps.storage.read.mockResolvedValue('synthetic.jwt');
    deps.auth.getMe.mockRejectedValue(new ApiError(kind, 'Fixture'));
    await expect(session.restore()).rejects.toMatchObject({ kind });
    expect(deps.storage.clear).not.toHaveBeenCalled();
  });

  test('restauración rechazada con 401 elimina token pero no inventa causa de correo', async () => {
    const { deps, session } = fixture();
    deps.storage.read.mockResolvedValue('synthetic.jwt');
    deps.auth.getMe.mockRejectedValue(new ApiError('http', 'Unauthorized', 401));
    await expect(session.restore()).rejects.toMatchObject({ status: 401 });
    expect(deps.storage.clear).toHaveBeenCalledTimes(1);
  });

  test('registro 202 no guarda token ni inicia sesión', async () => {
    const { deps, session } = fixture();
    await session.register('Fixture', user.email, 'synthetic-password');
    expect(deps.auth.register).toHaveBeenCalledTimes(1);
    expect(deps.storage.save).not.toHaveBeenCalled();
    await expect(session.refreshProfile()).rejects.toMatchObject({ kind: 'unauthenticated' });
  });

  test('logout local elimina token sin llamar endpoint remoto', async () => {
    const { deps, session } = fixture();
    await session.login(user.email, 'synthetic-password');
    await session.logout();
    expect(deps.storage.clear).toHaveBeenCalledTimes(1);
    await expect(session.refreshProfile()).rejects.toMatchObject({ kind: 'unauthenticated' });
  });

  test('logout durante restauración impide que la respuesta tardía reabra sesión', async () => {
    const { deps, session } = fixture();
    let finish: (response: ApiResponse) => void = () => { throw new Error('Not started'); };
    deps.storage.read.mockResolvedValue('synthetic.jwt');
    deps.auth.getMe.mockImplementationOnce(() => new Promise<ApiResponse>((resolve) => { finish = resolve; }));
    const restoring = session.restore();
    const assertion = expect(restoring).rejects.toMatchObject({ kind: 'cancelled' });
    await Promise.resolve();
    await session.logout();
    finish(response('synthetic-identity'));
    await assertion;
    expect(deps.users.getMe).not.toHaveBeenCalled();
    expect(deps.storage.save).not.toHaveBeenCalled();
  });

  test('logout durante login impide escritura tardía de JWT', async () => {
    const { deps, session } = fixture();
    let finish: (response: ApiResponse) => void = () => { throw new Error('Not started'); };
    deps.auth.login.mockImplementationOnce(() => new Promise<ApiResponse>((resolve) => { finish = resolve; }));
    const loggingIn = session.login(user.email, 'synthetic-password');
    const assertion = expect(loggingIn).rejects.toMatchObject({ kind: 'cancelled' });
    await session.logout();
    finish(response('synthetic-login'));
    await assertion;
    expect(deps.storage.save).not.toHaveBeenCalled();
  });

  test('fallo de almacenamiento impide reportar login/logout exitoso', async () => {
    const { deps, session } = fixture();
    deps.storage.save.mockRejectedValueOnce(new ApiError('storage', 'Fixture'));
    await expect(session.login(user.email, 'synthetic-password')).rejects.toMatchObject({ kind: 'storage' });
    deps.storage.clear.mockRejectedValueOnce(new ApiError('storage', 'Fixture'));
    await expect(session.logout()).rejects.toMatchObject({ kind: 'storage' });
  });

  test('perfil actualiza por lista blanca del servicio y vuelve a validar identidad', async () => {
    const { deps, session } = fixture();
    await session.login(user.email, 'synthetic-password');
    expect(await session.refreshProfile({ displayName: 'Fixture' })).toEqual(user);
    expect(deps.users.updateMe).toHaveBeenCalledWith('synthetic.jwt', { displayName: 'Fixture' });
  });

  test('perfil 401 invalida el token local', async () => {
    const { deps, session } = fixture();
    await session.login(user.email, 'synthetic-password');
    deps.auth.getMe.mockRejectedValueOnce(new ApiError('http', 'Unauthorized', 401));
    await expect(session.refreshProfile()).rejects.toMatchObject({ status: 401 });
    expect(deps.storage.clear).toHaveBeenCalledTimes(1);
    await expect(session.refreshProfile()).rejects.toMatchObject({ kind: 'unauthenticated' });
  });
});
