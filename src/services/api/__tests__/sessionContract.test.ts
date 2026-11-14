import { decodeAuthMeResponse, decodeAwsLoginResponse, decodeUserProfileResponse, sessionContract } from '../sessionContract';

const valid = {
  accessToken: 'synthetic.aws.token', expiresIn: 3600, tokenType: 'Bearer',
  user: { id: 'synthetic-mongo-id', roles: ['Buyer'], accountStatus: 'Active' },
};

describe('Contrato confirmado de sesión Backend', () => {
  test('decodifica login y no copia propiedades desconocidas', () => {
    expect(decodeAwsLoginResponse({ ...valid, extra: true, user: { ...valid.user, password: 'not-copied' } })).toEqual(valid);
    expect(sessionContract.decodeLogin(valid)).toBe(valid.accessToken);
  });

  test('acepta roles respaldados por Backend y conserva identidad mínima', () => {
    expect(sessionContract.decodeLoginUser?.(valid, ' Fixture@UTTT.EDU.MX ')).toEqual({
      id: valid.user.id, role: 'buyer', fullName: '', email: 'fixture@uttt.edu.mx', accountStatus: 'Active',
    });
    expect(sessionContract.decodeLoginUser?.({ ...valid, user: { ...valid.user, roles: ['Seller'] } }, 'fixture@uttt.edu.mx')).toMatchObject({ role: 'seller' });
    expect(sessionContract.decodeLoginUser?.({ ...valid, user: { ...valid.user, roles: ['Admin'] } }, 'fixture@uttt.edu.mx')).toMatchObject({ role: 'admin' });
  });

  test.each([
    null, [], {}, { ...valid, accessToken: '' }, { ...valid, accessToken: ' token' },
    { ...valid, expiresIn: 0 }, { ...valid, expiresIn: 1.5 }, { ...valid, tokenType: 'Basic' },
    { ...valid, user: undefined }, { ...valid, user: { ...valid.user, id: '' } },
    { ...valid, user: { ...valid.user, roles: [] } }, { ...valid, user: { ...valid.user, roles: ['Unknown'] } },
    { ...valid, user: { ...valid.user, accountStatus: 'PendingEmailVerification' } },
  ])('rechaza una respuesta de login inválida: %p', (payload) => {
    expect(() => decodeAwsLoginResponse(payload)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });

  test('valida auth/me y users/me, preservando nulos', () => {
    const identity = { id: 'synthetic-mongo-id', email: 'fixture@uttt.edu.mx', displayName: 'Server identity', roles: ['Buyer'], accountStatus: 'Active' };
    const profile = { ...identity, phone: null, avatarUrl: null };
    expect(decodeAuthMeResponse(identity)).toEqual(identity);
    expect(decodeUserProfileResponse(profile)).toMatchObject({ id: profile.id, email: profile.email, displayName: profile.displayName, phone: null, avatarUrl: null, roles: ['Buyer'] });
    const user = sessionContract.decodeIdentity!(identity);
    expect(sessionContract.decodeProfile!(profile, user)).toMatchObject({ id: identity.id, role: 'buyer', phone: null, avatar: null });
  });

  test.each([
    { id: '', email: 'fixture@uttt.edu.mx', displayName: 'x', roles: ['Buyer'], accountStatus: 'Active' },
    { id: 'id', email: 'fixture@evil.test', displayName: 'x', roles: ['Buyer'], accountStatus: 'Active' },
    { id: 'id', email: 'fixture@uttt.edu.mx', displayName: 'x', roles: [], accountStatus: 'Active' },
    { id: 'id', email: 'fixture@uttt.edu.mx', displayName: 'x', roles: ['Buyer'], accountStatus: 'Suspended' },
  ])('rechaza identidad incompatible: %p', (payload) => {
    expect(() => decodeAuthMeResponse(payload)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });

  test('rechaza perfil que cambia la identidad validada', () => {
    const identity = sessionContract.decodeIdentity!({ id: 'id', email: 'fixture@uttt.edu.mx', displayName: 'x', roles: ['Buyer'], accountStatus: 'Active' });
    expect(() => sessionContract.decodeProfile!({ id: 'other', email: 'fixture@uttt.edu.mx', displayName: 'x', roles: ['Buyer'], phone: null, avatarUrl: null }, identity))
      .toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
});
