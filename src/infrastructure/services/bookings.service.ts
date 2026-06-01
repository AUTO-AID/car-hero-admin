import { api } from "../api/client";

const normalizeOrder = (order: any) => ({
  ...order,
  _id: order._id ?? order.id,
  id: order.id ?? order._id,
  user: order.user ?? (order.userId ? { _id: order.userId, fullName: order.userName ?? order.userId } : undefined),
  provider: order.provider ?? (order.providerId ? { _id: order.providerId, businessName: order.providerName ?? order.providerId } : undefined),
  service: order.service ?? (order.serviceId ? { _id: order.serviceId, name: order.serviceName ?? order.serviceId } : undefined),
  payableAmount: order.payableAmount ?? order.totalAmount ?? order.total ?? 0,
  totalAmount: order.totalAmount ?? order.payableAmount ?? order.total ?? 0,
  location: order.location ?? order.userLocation,
});

const normalizeOrdersResponse = (payload: any, listKey: "orders" | "bookings") => {
  const container = payload?.data ?? payload;
  const rows = container?.orders ?? container?.bookings ?? (Array.isArray(container) ? container : []);
  const normalized = rows.map(normalizeOrder);

  return {
    ...payload,
    data: {
      ...(typeof container === "object" && !Array.isArray(container) ? container : {}),
      [listKey]: normalized,
      orders: listKey === "orders" ? normalized : container?.orders,
      pagination: container?.pagination,
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

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );

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

export const deleteBooking = (id: string) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
