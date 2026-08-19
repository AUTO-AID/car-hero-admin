import { api } from "../api/client";
import type { Booking } from "@/domain/entities/booking.types";
import { cleanParams, isRecord } from "@/infrastructure/api/response";

export type OrderRecord = Booking & {
  orderNumber?: string;
  address?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  serviceName?: string;
  userId?: string;
  userName?: string;
  providerId?: string;
  providerName?: string;
  serviceId?: string;
  userLocation?: Booking["location"];
  isScheduled?: boolean;
  startedAt?: string;
  completedAt?: string;
  acceptedAt?: string;
  userNotes?: string;
  total?: number;
  facets?: Record<string, unknown>;
  cancellationReason?: string;
  cancelledBy?: string;
};

export type OrdersPayload = {
  orders?: OrderRecord[];
  bookings?: OrderRecord[];
  total?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
  facets?: {
    totals?: Record<string, number>;
    statusCounts?: Array<{ _id: string; count: number }>;
    paymentMethods?: Array<{ _id: string; count: number }>;
  };
};

export type OrdersResponse = {
  data: OrdersPayload;
  orders?: OrderRecord[];
  bookings?: OrderRecord[];
  total?: number;
};

const normalizeOrder = (order: Partial<OrderRecord>): OrderRecord => ({
  ...order,
  _id: order._id ?? order.id,
  id: order.id ?? order._id,
  user: order.user ?? (order.userId ? { _id: order.userId, fullName: order.userName ?? order.userId } : undefined),
  provider: order.provider ?? (order.providerId ? { _id: order.providerId, businessName: order.providerName ?? order.providerId } : undefined),
  service: order.service ?? (order.serviceId ? { _id: order.serviceId, name: order.serviceName ?? order.serviceId } : undefined),
  payableAmount: order.payableAmount ?? order.totalAmount ?? order.total ?? 0,
  totalAmount: order.totalAmount ?? order.payableAmount ?? order.total ?? 0,
  location: order.location ?? order.userLocation,
} as OrderRecord);

const normalizeOrdersResponse = (payload: unknown, listKey: "orders" | "bookings"): OrdersResponse => {
  const container = isRecord(payload) && "data" in payload ? payload.data : payload;
  const source = isRecord(container) ? container : {};
  const rows = (source.orders ?? source.bookings ?? (Array.isArray(container) ? container : [])) as Partial<OrderRecord>[];
  const normalized = rows.map(normalizeOrder);

  return {
    ...(isRecord(payload) ? payload : {}),
    data: {
      ...(isRecord(container) ? container : {}),
      [listKey]: normalized,
      orders: listKey === "orders" ? normalized : source.orders as OrderRecord[] | undefined,
      pagination: source.pagination as OrdersPayload["pagination"],
    },
    [listKey]: normalized,
  };
};

export type OrderFilters = {
  status?: string;
  search?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  isScheduled?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getAllBookings = (page = 1, limit = 10, status?: string, filters: OrderFilters = {}) =>
  api
    .get("/bookings", { params: cleanParams({ page, limit, status, ...filters }) })
    .then((r) => normalizeOrdersResponse(r.data, "bookings"));

export const getAllOrders = (page = 1, limit = 10, status?: string, filters: OrderFilters = {}) =>
  api
    .get("/orders", { params: cleanParams({ page, limit, status, ...filters }) })
    .then((r) => normalizeOrdersResponse(r.data, "orders"));

export const getBookingById = (id: string) =>
  api.get(`/bookings/${id}`).then((r) => r.data);

export const updateBookingStatus = (id: string, status: string) =>
  api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

export const rejectOrder = (id: string, reason: string) =>
  api.patch(`/orders/${id}/status`, { status: "rejected", reason, cancelledBy: "admin" }).then((r) => r.data);

export const cancelOrder = (id: string, reason: string) =>
  api.post(`/orders/${id}/cancel`, { reason, cancelledBy: "admin" }).then((r) => r.data);

export const deleteBooking = (id: string) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
