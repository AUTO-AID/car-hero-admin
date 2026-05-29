import { api } from "../api/client";

export const getAllBookings = (page = 1, limit = 10, status?: string) =>
  api
    .get("/bookings", { params: { page, limit, status } })
    .then((r) => r.data);

export const getBookingById = (id: string) =>
  api.get(`/bookings/${id}`).then((r) => r.data);

export const updateBookingStatus = (id: string, status: string) =>
  api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

export const deleteBooking = (id: string) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
