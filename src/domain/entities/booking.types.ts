export interface BookingUser {
  id?: string;
  _id?: string;
  fullName: string;
  phoneNumber?: string;
}

export interface BookingService {
  id?: string;
  _id?: string;
  name: string;
  nameAr?: string;
}

export interface BookingProvider {
  id?: string;
  _id?: string;
  businessName: string;
  ownerName?: string;
}

export interface Booking {
  _id?: string;
  id?: string;
  bookingNumber?: string;
  orderNumber?: string;
  user: BookingUser;
  service: BookingService;
  provider?: BookingProvider;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled" | string;
  payableAmount: number;
  totalAmount?: number;
  notes?: string;
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string | Date;
}
