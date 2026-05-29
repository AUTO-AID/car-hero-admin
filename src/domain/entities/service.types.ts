export interface Service {
  _id?: string;
  id?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  basePrice: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
