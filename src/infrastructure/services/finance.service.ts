import { api } from "../api/client";

export type WalletTransactionFilters = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  ownerType?: string;
  referenceType?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string | number;
  amountMax?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );

export const getPlatformWallet = () =>
  api.get("/admin/wallet/stats").then((r) => r.data);

export const getAllTransactions = (page = 1, limit = 10, filters: WalletTransactionFilters = {}) =>
  api
    .get("/admin/wallet/transactions/all", {
      params: cleanParams({ ...filters, page, limit }),
    })
    .then((r) => r.data);

export const getPayoutRequests = (page = 1, limit = 10, status = "pending") =>
  api
    .get("/admin/wallet/transactions/all", {
      params: cleanParams({
        page,
        limit,
        type: "debit",
        status,
        ownerType: "provider",
        referenceType: "payout,withdrawal",
      }),
    })
    .then((r) => r.data);

export const approvePayout = (id: string, action: "complete" | "reject", note?: string) =>
  api.patch(`/admin/wallet/payouts/${id}`, { action, note }).then((r) => r.data);

export const handlePayout = approvePayout;
