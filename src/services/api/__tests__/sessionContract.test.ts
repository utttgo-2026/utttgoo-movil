import { decodeAuthMeResponse, decodeAwsLoginResponse, decodeUserProfileResponse, requireProfileContract, sessionContract } from '../sessionContract';

// Synthetic values in the backend-confirmed shape; not real tokens, accounts or MongoDB evidence.
const valid = {
  accessToken: 'synthetic.aws.token', expiresIn: 3600, tokenType: 'Bearer',
  user: { id: 'synthetic-mongo-id', roles: ['Buyer'], accountStatus: 'Active' },
};

describe('Contrato confirmado del login AWS', () => {
  test('valida y proyecta solo propiedades confirmadas', () => {
    expect(decodeAwsLoginResponse({ ...valid, unknown: 'not-copied', user: { ...valid.user, password: 'not-copied' } })).toEqual(valid);
    expect(sessionContract.decodeLogin(valid)).toBe(valid.accessToken);
  });

  test('User mínimo no inventa nombre/perfil ni usa el sub de Supabase como id MongoDB', () => {
    expect(sessionContract.decodeLoginUser?.(valid, ' Fixture@UTTT.EDU.MX ')).toEqual({
      id: 'synthetic-mongo-id', role: 'buyer', fullName: '', email: 'fixture@uttt.edu.mx',
    });
  });

  test.each([
    ['null', null], ['array', []], ['vacío', {}],
    ['token ausente', { ...valid, accessToken: undefined }], ['token vacío', { ...valid, accessToken: '' }],
    ['token no string', { ...valid, accessToken: 123 }], ['token con espacios', { ...valid, accessToken: ' synthetic.aws.token' }],
    ['token con control', { ...valid, accessToken: 'synthetic\u0000token' }],
    ['expiresIn ausente', { ...valid, expiresIn: undefined }], ['duración string', { ...valid, expiresIn: '3600' }],
    ['duración cero', { ...valid, expiresIn: 0 }], ['duración negativa', { ...valid, expiresIn: -1 }],
    ['duración fraccional', { ...valid, expiresIn: 1.5 }], ['duración infinita', { ...valid, expiresIn: Infinity }],
    ['duración insegura', { ...valid, expiresIn: Number.MAX_SAFE_INTEGER + 1 }],
    ['tokenType distinto', { ...valid, tokenType: 'Basic' }], ['tokenType ausente', { ...valid, tokenType: undefined }],
    ['user ausente', { ...valid, user: undefined }], ['user array', { ...valid, user: [] }],
    ['id vacío', { ...valid, user: { ...valid.user, id: '' } }], ['id no string', { ...valid, user: { ...valid.user, id: 12 } }],
    ['id con espacios', { ...valid, user: { ...valid.user, id: ' id ' } }],
    ['rol ausente', { ...valid, user: { ...valid.user, roles: undefined } }],
    ['rol string', { ...valid, user: { ...valid.user, roles: 'Buyer' } }],
    ['roles vacíos', { ...valid, user: { ...valid.user, roles: [] } }],
    ['rol desconocido', { ...valid, user: { ...valid.user, roles: ['Admin'] } }],
    ['roles múltiples sin prioridad acordada', { ...valid, user: { ...valid.user, roles: ['Buyer', 'Admin'] } }],
    ['rol con casing no acordado', { ...valid, user: { ...valid.user, roles: ['buyer'] } }],
    ['cuenta pendiente', { ...valid, user: { ...valid.user, accountStatus: 'PendingEmailVerification' } }],
    ['cuenta sin estado', { ...valid, user: { ...valid.user, accountStatus: undefined } }],
  ])('rechaza %s antes de aceptar un token', (_name, payload) => {
    expect(() => decodeAwsLoginResponse(payload)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });

  test('contratos /me ahora confirmados siguen siendo distintos al DTO de login', () => {
    expect(typeof requireProfileContract(sessionContract).decodeIdentity).toBe('function');
    expect(() => decodeAuthMeResponse(valid)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
    expect(() => decodeUserProfileResponse(valid)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
});

const identity = { id: 'synthetic-mongo-id', email: 'fixture@uttt.edu.mx', displayName: 'Server identity fixture', roles: ['Buyer'], accountStatus: 'Active' };
const profile = { id: identity.id, email: identity.email, displayName: 'Server profile fixture', roles: ['Buyer'], phone: null, avatarUrl: null };

describe('DTOs definitivos de identidad y perfil AWS', () => {
  test('auth/me valida Active/Buyer y users/me preserva phone/avatarUrl nulos', () => {
    expect(decodeAuthMeResponse(identity)).toEqual(identity);
    expect(decodeUserProfileResponse(profile)).toEqual(profile);
    const user = sessionContract.decodeIdentity!(identity);
    expect(sessionContract.decodeProfile!(profile, user)).toEqual({
      id: identity.id, email: identity.email, fullName: profile.displayName,
      role: 'buyer', accountStatus: 'Active', phone: null, avatar: null,
    });
  });
  test('campos de contacto string y nombre del perfil no cambian autorización', () => {
    const user = sessionContract.decodeIdentity!(identity);
    expect(sessionContract.decodeProfile!({ ...profile, phone: 'synthetic-phone', avatarUrl: 'https://images.example.test/fixture.jpg' }, user))
      .toMatchObject({ role: 'buyer', accountStatus: 'Active', fullName: profile.displayName, phone: 'synthetic-phone', avatar: 'https://images.example.test/fixture.jpg' });
  });
  test.each([
    ['null', null], ['array', []], ['id ausente', { ...identity, id: undefined }],
    ['id vacío', { ...identity, id: '' }], ['email numérico', { ...identity, email: 12 }],
    ['dominio ajeno', { ...identity, email: 'fixture@uttt.edu.mx.evil.test' }],
    ['nombre no string', { ...identity, displayName: null }], ['roles vacíos', { ...identity, roles: [] }],
    ['rol no acordado', { ...identity, roles: ['Admin'] }], ['roles no array', { ...identity, roles: 'Buyer' }],
    ['cuenta pendiente', { ...identity, accountStatus: 'PendingEmailVerification' }],
    ['estado ausente', { ...identity, accountStatus: undefined }],
  ])('auth/me rechaza %s sin inventar identidad', (_name, response) => {
    expect(() => decodeAuthMeResponse(response)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
  test.each([
    ['null', null], ['phone omitido', { ...profile, phone: undefined }], ['phone numérico', { ...profile, phone: 123 }],
    ['avatar omitido', { ...profile, avatarUrl: undefined }], ['avatar objeto', { ...profile, avatarUrl: {} }],
    ['nombre omitido', { ...profile, displayName: undefined }], ['email null', { ...profile, email: null }],
    ['id vacío', { ...profile, id: '' }], ['roles no string válidos', { ...profile, roles: [1] }],
    ['rol no acordado', { ...profile, roles: ['Seller'] }],
  ])('users/me rechaza %s', (_name, response) => {
    expect(() => decodeUserProfileResponse(response)).toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
  test.each([
    { ...profile, id: 'different-mongo-id' }, { ...profile, email: 'different@uttt.edu.mx' }, { ...profile, roles: ['Admin'] },
  ])('perfil no puede cambiar id/email/autorización de identidad validada', (response) => {
    expect(() => sessionContract.decodeProfile!(response, sessionContract.decodeIdentity!(identity)))
      .toThrow(expect.objectContaining({ kind: 'invalid_response' }));
  });
});
