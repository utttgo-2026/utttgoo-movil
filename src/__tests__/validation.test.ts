import { isInstitutionalEmail } from '@/utils/validation';

describe('isInstitutionalEmail', () => {
  it('accepts institutional addresses', () => {
    expect(isInstitutionalEmail(' alumno@utt.edu.mx ')).toBe(true);
  });

  it('rejects external domains', () => {
    expect(isInstitutionalEmail('alumno@example.com')).toBe(false);
  });
});
