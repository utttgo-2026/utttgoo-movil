import { registrationDiagnostic } from '../registrationDiagnostics';
import * as beta from '@/config/betaRegistration';

describe('Diagnósticos de registro sanitizados', () => {
  afterEach(() => jest.restoreAllMocks());

  test('proyecta solo campos permitidos, ignorando propiedades adicionales', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    registrationDiagnostic(Object.assign({ event: 'response' as const, status: 400 }, {
      email: 'private@example.test', password: 'private-password', data: { token: 'private-token' },
    }));
    expect(log).toHaveBeenCalledWith('[aws-register]', {
      event: 'response', method: 'POST', path: '/api/v1/auth/register', timestamp: expect.any(String), status: 400,
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain('private');
  });

  test.each(['https://host.example.test/path?email=private', 'https://private:secret@host.example.test', 'http://host.example.test'])
  ('no imprime orígenes con datos extra ni HTTP: %s', (origin) => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    registrationDiagnostic({ event: 'request_start', origin });
    expect(log).not.toHaveBeenCalled();
  });

  test('no registra nada en producción', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    registrationDiagnostic({ event: 'response', status: 200 });
    expect(log).not.toHaveBeenCalled();
  });

  test('Beta interna explícita permite solo diagnósticos sanitizados aun sin __DEV__', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    jest.spyOn(beta, 'isBetaRegistrationOnly').mockReturnValue(true);
    registrationDiagnostic({ event: 'response', status: 202 });
    expect(log).toHaveBeenCalledWith('[aws-register]', expect.objectContaining({ event: 'response', status: 202 }));
  });

  test('validación del formulario se identifica sin campos ni valores', () => {
    const log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    registrationDiagnostic({ event: 'form_validation_failed' });
    expect(log).toHaveBeenCalledWith('[aws-register]', {
      event: 'form_validation_failed', method: 'POST', path: '/api/v1/auth/register', timestamp: expect.any(String), kind: 'validation',
    });
  });
});
