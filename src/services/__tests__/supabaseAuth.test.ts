import { getSupabaseClient } from '../supabaseClient';
import { resendSignupOtp, validateOtp, verifySignupOtp } from '../supabaseAuth';

jest.mock('../supabaseClient', () => ({ getSupabaseClient: jest.fn() }));

const client = { auth: { verifyOtp: jest.fn(), resend: jest.fn() } };

describe('Supabase OTP de registro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getSupabaseClient).mockReturnValue(client as never);
  });

  test('valida exactamente seis dígitos', () => {
    expect(validateOtp('123456')).toBe('123456');
    expect(() => validateOtp('12345')).toThrow();
    expect(() => validateOtp('12345a')).toThrow();
  });

  test('verifica con el tipo oficial signup', async () => {
    client.auth.verifyOtp.mockResolvedValue({ error: null });
    await verifySignupOtp('alumno@utt.edu.mx', '123456');
    expect(client.auth.verifyOtp).toHaveBeenCalledWith({ email: 'alumno@utt.edu.mx', token: '123456', type: 'signup' });
  });

  test('propaga fallo de verifyOtp y resend sin exponer respuesta', async () => {
    client.auth.verifyOtp.mockResolvedValue({ error: new Error('invalid') });
    client.auth.resend.mockResolvedValue({ error: new Error('failed') });
    await expect(verifySignupOtp('alumno@utt.edu.mx', '123456')).rejects.toThrow('no es válido');
    await expect(resendSignupOtp('alumno@utt.edu.mx')).rejects.toThrow('No se pudo reenviar');
    await expect(resendSignupOtp('alumno@utt.edu.mx')).rejects.toBeInstanceOf(Error);
  });
});
