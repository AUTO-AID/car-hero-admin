import { api } from "../api/client";

export const adminLogin = (data: { email: string; password: string }) =>
  api.post("/admin/login", data).then((r) => r.data);

export const adminLogout = () =>
  api.post("/admin/logout").then((r) => r.data);

export const getAdminProfile = () =>
  api.get("/admin/me").then((r) => r.data);
