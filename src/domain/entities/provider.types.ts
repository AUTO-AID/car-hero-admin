export interface Provider {
  _id?: string;
  id?: string;
  phone: string;
  businessName: string;
  ownerName: string;
  description?: string;
  city?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  totalOrders?: number;
  totalReviews?: number;
  averageRating?: number;
  status: "pending" | "approved" | "rejected" | "active" | "inactive" | string;
  serviceCategories?: string[];
  services?: string[] | any[];
  documents?: string[];
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}
