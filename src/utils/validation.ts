export function isInstitutionalEmail(email: string): boolean {
  return /^[^\s@]+@utt\.edu\.mx$/i.test(email.trim());
}
