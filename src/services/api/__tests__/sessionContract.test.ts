import { sessionContract } from '../sessionContract';

describe('Contratos runtime de sesión', () => {
  const identity = { id: '65f3a8c9e4b0a1b2c3d4e5f6', email: 'juan.perez@utt.edu.mx', displayName: 'Juan Pérez', roles: ['Buyer'], accountStatus: 'Active' };
  const profile = { id: identity.id, displayName: identity.displayName, email: identity.email, phone: null, avatarUrl: null, roles: ['Buyer'] };

  test('decodifica auth/me y users/me separadamente con nulos', () => {
    const decodedIdentity = sessionContract.decodeIdentity(identity);
    expect(decodedIdentity).toEqual({ id: identity.id, email: identity.email, fullName: identity.displayName, role: 'buyer' });
    expect(sessionContract.decodeProfile(profile, decodedIdentity)).toEqual({ id: identity.id, email: identity.email, fullName: identity.displayName, role: 'buyer' });
  });

  test('mapea roles conocidos y rechaza desconocidos', () => {
    expect(sessionContract.decodeIdentity({ ...identity, roles: ['Seller'] }).role).toBe('seller');
    expect(() => sessionContract.decodeIdentity({ ...identity, roles: ['Unknown'] })).toThrow('no soportado');
  });

  test('mantiene bloqueado el JWT sin contrato de login', () => {
    expect(() => sessionContract.decodeLogin({ accessToken: 'not-trusted' })).toThrow('BLOCKED_BY_BACKEND_LOGIN_RESPONSE_CONTRACT');
  });
});
