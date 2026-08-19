"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUsersAnalytics,
} from "@/infrastructure/services/users.service";
import { apiErrorMessage, isRecord } from "@/infrastructure/api/response";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { useDebouncedValue } from "@/application/hooks/use-debounced-value";
import type { User } from "@/domain/entities/user.types";
import UsersStats from "./components/users-stats";
import UsersCharts from "./components/users-charts";
import UsersTable from "./components/users-table";
import { UserDetailsSheet } from "./components/user-details-sheet";

type AdminUserRow = User & {
  phone?: string;
  subscriptionPlanName?: string;
  subscriptionPlanNameAr?: string;
  subscriptionStatus?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
  lastLoginAt?: string;
};

type UsersApiBody = {
  data?: AdminUserRow[];
  meta?: { total?: number };
  pagination?: { total?: number };
  total?: number;
};

function normalizeUsersResult(value: unknown) {
  const body = isRecord(value) && "data" in value ? value.data : value;
  if (Array.isArray(body)) {
    return { users: body as AdminUserRow[], total: body.length };
  }
  if (isRecord(body)) {
    const typed = body as UsersApiBody;
    const users = Array.isArray(typed.data) ? typed.data : [];
    return {
      users,
      total: typed.meta?.total ?? typed.pagination?.total ?? typed.total ?? users.length,
    };
  }
  return { users: [], total: 0 };
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "standard">("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "active" | "expired" | "cancelled" | "none">("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [minBalance, setMinBalance] = useState("");
  const [maxBalance, setMaxBalance] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const currentFilters = {
    search: debouncedSearch.trim() || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    isPremium: premiumFilter === "all" ? undefined : premiumFilter === "premium",
    subscriptionStatus: subscriptionFilter === "all" ? undefined : subscriptionFilter,
    planTier: planFilter === "all" ? undefined : planFilter,
    minBalance: minBalance || undefined,
    maxBalance: maxBalance || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: queryKeys.users.list(page, currentFilters),
    queryFn: () => getAllUsers(page, 10, currentFilters),
    retry: false,
    placeholderData: keepPreviousData,
  });

  const { data: analyticsData } = useQuery({
    queryKey: queryKeys.users.analytics,
    queryFn: getUsersAnalytics,
    retry: false,
  });

  const { data: selectedUserData, isLoading: isUserDetailsLoading } = useQuery({
    queryKey: queryKeys.users.detail(selectedUserId),
    queryFn: () => getUserById(selectedUserId as string),
    enabled: Boolean(selectedUserId),
    retry: false,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      setMutatingUserId(id);
      return updateUserStatus(id, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("تم تحديث حالة المستخدم بنجاح");
      setMutatingUserId(null);
    },
    onError: () => {
      toast.error("فشل تحديث حالة المستخدم");
      setMutatingUserId(null);
    },
  });

  const removeUser = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("تم حذف المستخدم بنجاح");
    },
    onError: () => toast.error("فشل حذف المستخدم"),
  });


  const { users: displayUsers, total: filteredTotal } = normalizeUsersResult(data);
  const analytics = analyticsData ?? {};
  const activeCount = analytics?.activeCount ?? 0;
  const premiumCount = analytics?.premiumCount ?? 0;
  const total = analytics?.totalUsers ?? filteredTotal;
  const selectedUser = isRecord(selectedUserData) && "data" in selectedUserData ? selectedUserData.data : selectedUserData;

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleStatus.mutate({ id, isActive });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟")) {
      removeUser.mutate(id);
    }
  };

  const handleExportUsers = async () => {
    try {
      const result = await getAllUsers(1, 100, currentFilters);
      const { users: rows } = normalizeUsersResult(result);
      const csvRows: Array<Array<string | number>> = [
        ["name", "phone", "active", "premium", "subscription", "walletBalance", "loyaltyPoints", "lastLoginAt"],
        ...rows.map((user) => [
          user.fullName || "",
          user.phoneNumber || user.phone || "",
          user.isActive ? "active" : "inactive",
          user.isPremium ? "premium" : "standard",
          user.subscriptionPlanNameAr || user.subscriptionPlanName || user.subscriptionStatus || "none",
          user.walletBalance ?? 0,
          user.loyaltyPoints ?? 0,
          user.lastLoginAt || "",
        ]),
      ];
      const csv = csvRows
        .map((row) => row.map((cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير بيانات العملاء بنجاح");
    } catch {
      toast.error("فشل تصدير بيانات العملاء");
    }
  };

  return (
    <div className="space-y-6">
      <UsersStats
        total={total}
        premiumCount={premiumCount}
        activeCount={activeCount}
      />

      <UsersCharts users={displayUsers} analytics={analytics} />

      <UsersTable
        users={displayUsers}
        isLoading={isLoading}
        isFetching={isFetching}
        total={filteredTotal}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        premiumFilter={premiumFilter}
        setPremiumFilter={setPremiumFilter}
        subscriptionFilter={subscriptionFilter}
        setSubscriptionFilter={setSubscriptionFilter}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        minBalance={minBalance}
        setMinBalance={setMinBalance}
        maxBalance={maxBalance}
        setMaxBalance={setMaxBalance}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        page={page}
        setPage={setPage}
        onViewUser={setSelectedUserId}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onExportUsers={handleExportUsers}
        mutatingUserId={mutatingUserId}
        errorMessage={isError ? apiErrorMessage(error, "تعذر تحميل بيانات العملاء") : undefined}
      />
      <UserDetailsSheet
        open={Boolean(selectedUserId)}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        user={selectedUser}
        isLoading={isUserDetailsLoading}
      />
    </div>
  );
}
