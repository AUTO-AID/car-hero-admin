"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "@/infrastructure/services/users.service";
import UsersStats from "./components/users-stats";
import UsersCharts from "./components/users-charts";
import UsersTable from "./components/users-table";


export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, statusFilter],
    queryFn: () => getAllUsers(
      page, 
      10, 
      search, 
      statusFilter === "all" ? undefined : statusFilter === "active"
    ),
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


  const displayUsers = data?.data?.users ?? (Array.isArray(data?.data) ? data.data : (data?.users ?? []));
  const total = data?.data?.pagination?.total ?? data?.data?.total ?? data?.total ?? 0;

  const activeCount = displayUsers.filter((u: any) => u.isActive).length;
  const premiumCount = displayUsers.filter((u: any) => u.isPremium).length;

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleStatus.mutate({ id, isActive });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟")) {
      removeUser.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <UsersStats
        total={total}
        premiumCount={premiumCount}
        activeCount={activeCount}
      />

      <UsersCharts users={displayUsers} />

      <UsersTable
        users={displayUsers}
        isLoading={isLoading}
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        page={page}
        setPage={setPage}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        mutatingUserId={mutatingUserId}
      />
    </div>
  );
}
