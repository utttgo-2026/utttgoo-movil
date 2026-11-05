import type { User } from '@/types/models';

export const demoUsers: User[] = [
  {
    id: 'buyer-1',
    role: 'buyer',
    fullName: 'Mariana López Cruz',
    email: '20230184@utt.edu.mx',
    phone: '771 123 4567',
    studentId: '20230184',
    career: 'Ingeniería en Desarrollo de Software',
    joinedAt: '2024-08-19',
  },
  {
    id: 'seller-1',
    role: 'seller',
    fullName: 'Ana Sofía Ramírez',
    email: 'vendedor@utt.edu.mx',
    phone: '771 234 5678',
    avatar: 'https://i.pravatar.cc/200?img=47',
    sellerBio: 'Comida casera preparada en el campus, todos los días.',
    rating: 4.8,
    reviewCount: 126,
    isSellerActive: true,
    joinedAt: '2024-02-10',
  },
  {
    id: 'admin-1',
    role: 'admin',
    fullName: 'Administrador UTTT-Go',
    email: 'admin@utt.edu.mx',
    joinedAt: '2023-01-15',
  },
];

export const demoAccounts = [
  { role: 'buyer' as const, email: '20230184@utt.edu.mx', password: '12345678' },
  { role: 'seller' as const, email: 'vendedor@utt.edu.mx', password: '12345678' },
  { role: 'admin' as const, email: 'admin@utt.edu.mx', password: '12345678' },
];

export function findDemoUserByEmail(email: string): User | undefined {
  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
