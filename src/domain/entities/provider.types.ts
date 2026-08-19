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
  services?: Array<string | { _id?: string; id?: string; name?: string; nameAr?: string }>;
  documents?: string[];
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderMapPoint {
  _id: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  governorate?: string;
  address?: string;
  status?: string;
  accountStatus?: string;
  registrationStatus?: string;
  isActive?: boolean;
  isApproved?: boolean;
  emergency247?: boolean;
  is_emergency?: boolean;
  serviceCategories?: string[];
  requestedServices?: string[];
  services_list?: Array<{ name?: string; service_id?: string; nameAr?: string }>;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  totalOrders?: number;
  completedOrders?: number;
  activeOrders?: number;
  completedRevenue?: number;
  completionRate?: number;
  cancellationRate?: number;
  averageResponseTime?: number;
  last30DaysOrders?: number;
  averageRating?: number;
  totalReviews?: number;
  lastOrderAt?: string;
  lastOnlineAt?: string;
  createdAt?: string;
}

export interface ProviderMapSummary {
  total: number;
  activeApproved: number;
  online: number;
  busy: number;
  emergency: number;
  totalOrders: number;
  completedRevenue: number;
  missingLocation: number;
}

export interface ProviderMapFacetItem {
  _id: string;
  count: number;
}

export interface ProviderMapResponse {
  providers: ProviderMapPoint[];
  data?: ProviderMapPoint[];
  summary: ProviderMapSummary;
  facets: {
    locations?: ProviderMapFacetItem[];
    governorates: ProviderMapFacetItem[];
    cities: ProviderMapFacetItem[];
    services: ProviderMapFacetItem[];
  };
}
