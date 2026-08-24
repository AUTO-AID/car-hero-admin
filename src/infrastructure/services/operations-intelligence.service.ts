import { api } from "../api/client";
import { cleanParams, unwrapApiData } from "../api/response";

export type OperationsPreviewParams = {
  days?: number;
  previousDays?: number;
  limit?: number;
  city?: string;
  serviceId?: string;
};

export type OperationalListParams = {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  severity?: string;
  type?: string;
  city?: string;
  serviceId?: string;
};

export type PressureArea = {
  key: string;
  city: string;
  governorate?: string;
  serviceId: string;
  serviceName: string;
  serviceNameAr?: string;
  ordersCount: number;
  previousOrdersCount: number;
  completedOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  unassignedOrders: number;
  avgResponseMinutes: number;
  activeProviders: number;
  pressureScore: number;
  level: "healthy" | "watch" | "pressured" | "critical";
  ordersPerProvider: number;
  cancelRate: number;
  unassignedRate: number;
  recentGrowthRate: number;
  /**
   * تفصيل درجة الضغط إلى مكوّناتها الخمسة (0-100 لكل مكوّن). الخادم يرسلها
   * منذ البداية ولم تكن معلَنة هنا، فكانت اللوحة تعرض رقماً بلا تفسير — وهو
   * أكثر ما يجعل مؤشّراً كهذا غير قابل للتصرّف بناءً عليه.
   */
  componentScores?: {
    ordersPerProvider: number;
    cancelRate: number;
    responseTime: number;
    unassigned: number;
    growth: number;
  };
};

export type OperationalRecommendation = {
  _id?: string;
  id?: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  status?: "new" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
  city?: string;
  governorate?: string;
  serviceId?: string;
  serviceName?: string;
  title?: string;
  summary?: string;
  reason?: string;
  reasons?: string[];
  recommendedProviders?: number;
  evidence?: Record<string, unknown>;
  detectedAt?: string;
  lastSeenAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  dismissedAt?: string;
  dueAt?: string;
  slaStatus?: "on_track" | "due_soon" | "overdue";
  assignedToAdmin?: string;
  assignedAt?: string;
  resolutionNote?: string;
  notificationSentAt?: string;
  notes?: Array<{ text: string; adminName?: string; createdAt?: string }>;
};

export type OperationalAlert = {
  _id?: string;
  id?: string;
  type: string;
  severity: "info" | "warning" | "high" | "critical";
  status: "unread" | "read" | "resolved";
  title: string;
  message: string;
  city?: string;
  governorate?: string;
  evidence?: Record<string, unknown>;
  detectedAt?: string;
  lastSeenAt?: string;
  notificationSentAt?: string;
  recommendation?: string;
};

export type ProviderWorkload = {
  providerId: string;
  businessName?: string;
  city?: string;
  governorate?: string;
  status?: string;
  averageRating?: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  avgResponseMinutes: number;
  completionRate?: number;
  cancelRate?: number;
  workloadLevel: "overloaded" | "risky" | "strategic" | "champion" | "underused" | "normal";
  reasons?: string[];
};

export type OperationsPreview = {
  meta?: Record<string, unknown>;
  summary?: {
    networkHealthScore?: number;
    analyzedAreaServices?: number;
    criticalAreas?: number;
    pressuredAreas?: number;
    recommendationsCount?: number;
    topRecommendation?: OperationalRecommendation | null;
  };
  pressureAreas?: PressureArea[];
  recommendations?: OperationalRecommendation[];
  providerWorkload?: ProviderWorkload[];
};

export const getOperationsPreview = (params: OperationsPreviewParams = {}) =>
  api
    .get("/admin/operations-intelligence/preview", { params: cleanParams(params) })
    .then((r) => unwrapApiData<OperationsPreview>(r.data));

export const runOperationsScan = (body: OperationsPreviewParams = {}) =>
  api
    .post("/admin/operations-intelligence/scan", cleanParams(body))
    .then((r) => unwrapApiData<{ preview: OperationsPreview; scan: Record<string, unknown> }>(r.data));

export const getOperationalRecommendations = (params: OperationalListParams = {}) =>
  api
    .get("/admin/operations-intelligence/recommendations", { params: cleanParams(params) })
    .then((r) => unwrapApiData(r.data));

export const updateOperationalRecommendationStatus = (
  id: string,
  body: { status: string; note?: string },
) =>
  api
    .patch(`/admin/operations-intelligence/recommendations/${id}/status`, body)
    .then((r) => unwrapApiData<OperationalRecommendation>(r.data));

export const addOperationalRecommendationNote = (id: string, note: string) =>
  api
    .post(`/admin/operations-intelligence/recommendations/${id}/notes`, { note })
    .then((r) => unwrapApiData<OperationalRecommendation>(r.data));

export const assignOperationalRecommendation = (
  id: string,
  body: { assignedToAdmin?: string; dueAt?: string; note?: string },
) =>
  api
    .patch(`/admin/operations-intelligence/recommendations/${id}/assign`, body)
    .then((r) => unwrapApiData<OperationalRecommendation>(r.data));

export const getOperationalAlerts = (params: OperationalListParams = {}) =>
  api
    .get("/admin/operations-intelligence/alerts", { params: cleanParams(params) })
    .then((r) => unwrapApiData(r.data));

export const markOperationalAlertRead = (id: string) =>
  api.patch(`/admin/operations-intelligence/alerts/${id}/read`).then((r) => unwrapApiData<OperationalAlert>(r.data));

export const resolveOperationalAlert = (id: string) =>
  api.patch(`/admin/operations-intelligence/alerts/${id}/resolve`).then((r) => unwrapApiData<OperationalAlert>(r.data));
