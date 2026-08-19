import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../api/client", () => ({
  api: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "../../api/client";
import { adminLogin } from "../auth.service";
import { cancelOrder, rejectOrder } from "../bookings.service";
import { approvePayout } from "../finance.service";

const mockedApi = vi.mocked(api);

describe("critical admin services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unwraps admin login responses and returns tokens", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          admin: { id: "admin-1", name: "Admin", email: "admin@carhero.com", role: "admin" },
        },
      },
    });

    await expect(adminLogin({ email: "admin@carhero.com", password: "Admin@123" })).resolves.toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      admin: { id: "admin-1" },
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/admin/login", {
      email: "admin@carhero.com",
      password: "Admin@123",
    });
  });

  it("cancels orders through the reasoned cancel endpoint", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { success: true } });

    await cancelOrder("order-1", "Customer requested cancellation");

    expect(mockedApi.post).toHaveBeenCalledWith("/orders/order-1/cancel", {
      reason: "Customer requested cancellation",
      cancelledBy: "admin",
    });
  });

  it("rejects orders through the dedicated rejection flow with a reason", async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true } });

    await rejectOrder("order-2", "Provider unavailable");

    expect(mockedApi.patch).toHaveBeenCalledWith("/orders/order-2/status", {
      status: "rejected",
      reason: "Provider unavailable",
      cancelledBy: "admin",
    });
  });

  it("processes payout requests with an explicit action and note", async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: { success: true } });

    await approvePayout("payout-1", "reject", "Bank details need review");

    expect(mockedApi.patch).toHaveBeenCalledWith("/admin/wallet/payouts/payout-1", {
      action: "reject",
      note: "Bank details need review",
    });
  });
});
