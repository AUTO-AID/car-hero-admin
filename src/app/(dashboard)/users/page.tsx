"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUsersAnalytics,
} from "@/infrastructure/services/users.service";
import UsersStats from "./components/users-stats";
import UsersCharts from "./components/users-charts";
import UsersTable from "./components/users-table";
import { UserDetailsSheet } from "./components/user-details-sheet";


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

  const currentFilters = {
    search: search.trim() || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    isPremium: premiumFilter === "all" ? undefined : premiumFilter === "premium",
    subscriptionStatus: subscriptionFilter === "all" ? undefined : subscriptionFilter,
    planTier: planFilter === "all" ? undefined : planFilter,
    minBalance: minBalance || undefined,
    maxBalance: maxBalance || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", page, currentFilters],
    queryFn: () => getAllUsers(page, 10, currentFilters),
    retry: false,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["admin-users-analytics"],
    queryFn: getUsersAnalytics,
    retry: false,
  });

  const { data: selectedUserData, isLoading: isUserDetailsLoading } = useQuery({
    queryKey: ["admin-user-details", selectedUserId],
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم حذف المستخدم بنجاح");
    },
    onError: () => toast.error("فشل حذف المستخدم"),
  });


  const apiData = data?.data ?? data;
  const displayUsers = Array.isArray(apiData?.data) ? apiData.data : (Array.isArray(apiData) ? apiData : []);
  const analytics = analyticsData?.data ?? analyticsData;
  const activeCount = analytics?.activeCount ?? 0;
  const premiumCount = analytics?.premiumCount ?? 0;
  const filteredTotal = apiData?.meta?.total ?? apiData?.pagination?.total ?? apiData?.total ?? displayUsers.length;
  const total = analytics?.totalUsers ?? filteredTotal;
  const selectedUser = selectedUserData?.data ?? selectedUserData;

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
      const payload = result?.data ?? result;
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const csvRows: Array<Array<string | number>> = [
        ["name", "phone", "active", "premium", "subscription", "walletBalance", "loyaltyPoints", "lastLoginAt"],
        ...rows.map((user: any) => [
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

      <UsersCharts users={displayUsers} analytics={analyticsData?.data ?? analyticsData} />

      <UsersTable
        users={displayUsers}
        isLoading={isLoading}
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
        errorMessage={isError ? ((error as any)?.response?.data?.message || "تعذر تحميل بيانات العملاء") : undefined}
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
