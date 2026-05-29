export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  phoneNumber: string;
  role: "user" | "provider" | "admin" | string;
  isActive: boolean;
  isPremium?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
