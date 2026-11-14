export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  accountStatus?: 'Active';
  studentId?: string;
  career?: string;
  isSellerActive?: boolean;
  sellerBio?: string;
  rating?: number;
  reviewCount?: number;
  joinedAt?: string;
  password?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
}

export type FoodAvailability = 'available' | 'sold-out' | 'scheduled';

export interface FoodItem {
  id: string;
  sellerId: string;
  sellerName?: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  stock: number;
  availability: FoodAvailability;
  tags: string[];
  isFavorite?: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  pickupAt?: string;
  pickupLocation: string;
  notes?: string;
  paymentMethod: 'cash';
  qrPayload?: string;
  rated?: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  isActive: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: 'order' | 'chat' | 'system';
}

export interface Review {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'visible' | 'hidden';
}
