import { api } from "../api/client";

export interface AppSettings {
  appName: string;
  appVersion: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  minWithdrawalAmount: number;
  defaultCurrency: "SYP" | "SAR" | "USD";
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageAr: string;
}

const unwrap = <T>(payload: { data?: T } | T): T =>
  payload && typeof payload === "object" && "data" in payload ? (payload.data as T) : payload as T;

export const getSettings = () =>
  api.get("/admin/settings").then((response) => unwrap<AppSettings>(response.data));

export const updateSettings = (data: Partial<Pick<AppSettings, "appName" | "contactEmail" | "contactPhone" | "commissionRate" | "minWithdrawalAmount" | "defaultCurrency">>) =>
  api.patch("/admin/settings", data).then((response) => unwrap<AppSettings>(response.data));

export const updateMaintenanceMode = (data: {
  maintenanceMode: boolean;
  message?: string;
  messageAr?: string;
}) => api.patch("/admin/settings/maintenance", data).then((response) => unwrap<AppSettings>(response.data));
