export interface Service {
  _id?: string;
  id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  basePrice: number;
  discountedPrice?: number;
  estimatedDuration: number;
  isEmergency?: boolean;
  isSystemService?: boolean;
  sortOrder?: number;
  ordersCount?: number;
  ordersRevenue?: number;
  completedOrdersCount?: number;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
