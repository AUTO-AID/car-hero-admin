import { api } from "../api/client";
import type { Admin } from "@/domain/entities/auth.types";
import { unwrapApiData } from "@/infrastructure/api/response";

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  message?: string;
  admin: Admin;
  accessToken: string;
  refreshToken: string;
};

export const adminLogin = (data: AdminLoginRequest) =>
  api.post("/admin/login", data).then((r) => unwrapApiData<AdminLoginResponse>(r.data));

export const adminLogout = () =>
  api.post("/admin/logout").then((r) => unwrapApiData<{ message: string }>(r.data));

export const getAdminProfile = () =>
  api.get("/admin/me").then((r) => unwrapApiData<{ admin: Admin }>(r.data));
