export const queryKeys = {
  admins: {
    all: ["admins"] as const,
    list: (filters: unknown) => ["admins", "list", filters] as const,
  },

  audit: {
    all: ["audit-logs"] as const,
    list: (page: number, filters: unknown) => ["audit-logs", "list", page, filters] as const,
    stats: ["audit-logs", "stats"] as const,
    related: (entityType?: string, entityId?: string) => ["audit-logs", "related", entityType, entityId] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (page: number, status: string) => ["bookings", "list", page, status] as const,
    analytics: ["bookings", "analytics"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: ["dashboard", "summary"] as const,
    providersByGovernorate: ["dashboard", "providers-by-governorate"] as const,
    providersByService: ["dashboard", "providers-by-service"] as const,
    providersGrowth: ["dashboard", "providers-growth"] as const,
    topCities: ["dashboard", "top-cities"] as const,
    recentBookings: ["dashboard", "recent-bookings"] as const,
  },
  finance: {
    all: ["finance"] as const,
    platformWallet: ["finance", "platform-wallet"] as const,
    transactions: (page: number, filters: unknown) => ["finance", "transactions", page, filters] as const,
    transactionsChart: (dateFrom?: string, dateTo?: string) => ["finance", "transactions-chart", dateFrom, dateTo] as const,
    payouts: (page: number, status: string) => ["finance", "payouts", page, status] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread-count"] as const,
    stats: ["notifications", "stats"] as const,
    campaigns: (page: number, filters: unknown) => ["notifications", "campaigns", page, filters] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (page: number, status: string, filters: unknown) => ["orders", "list", page, status, filters] as const,
  },
  operationsIntelligence: {
    all: ["operations-intelligence"] as const,
    preview: (params: unknown) => ["operations-intelligence", "preview", params] as const,
    recommendations: (params: unknown) => ["operations-intelligence", "recommendations", params] as const,
    alerts: (params: unknown) => ["operations-intelligence", "alerts", params] as const,
  },
  providers: {
    all: ["providers"] as const,
    list: (filters: unknown, page: number) => ["providers", "list", filters, page] as const,
    map: (filters: unknown) => ["providers", "map", filters] as const,
    excelSummary: ["providers", "excel-summary"] as const,
    topRequested: (limit: number) => ["providers", "top-requested", limit] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    list: (page: number, filters: unknown) => ["reviews", "list", page, filters] as const,
    stats: ["reviews", "stats"] as const,
  },
  services: {
    all: ["services"] as const,
    list: (filters: unknown) => ["services", "list", filters] as const,
  },
  settings: {
    all: ["settings"] as const,
    detail: ["settings", "detail"] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    plans: ["subscriptions", "plans"] as const,
    stats: ["subscriptions", "stats"] as const,
    users: (page: number, filters: unknown) => ["subscriptions", "users", page, filters] as const,
  },
  users: {
    all: ["users"] as const,
    list: (page: number, filters: unknown) => ["users", "list", page, filters] as const,
    analytics: ["users", "analytics"] as const,
    detail: (id?: string | null) => ["users", "detail", id] as const,
  },
};
