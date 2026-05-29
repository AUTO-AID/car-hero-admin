import { api } from "../api/client";

export const getPlatformWallet = () =>
  api.get("/admin/wallet/stats").then((r) => r.data);

export const getAllTransactions = (page = 1, limit = 10) =>
  api
    .get("/admin/wallet/transactions/all", { params: { page, limit } })
    .then((r) => r.data);

export const getPayoutRequests = (page = 1, limit = 10, status = "pending") =>
  api
    .get("/admin/wallet/transactions/all", {
      params: { page, limit, type: "WITHDRAWAL", status },
    })
    .then((r) => r.data);

export const approvePayout = (id: string, action: "complete" | "reject", note?: string) =>
  api.patch(`/admin/wallet/payouts/${id}`, { action, note }).then((r) => r.data);

export const handlePayout = approvePayout;
