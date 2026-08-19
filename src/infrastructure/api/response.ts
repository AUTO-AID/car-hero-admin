import { AxiosError } from "axios";

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string | string[];
  timestamp?: string;
};

export type PaginatedResponse<T> = {
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
};

export type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function unwrapApiData<T>(payload: ApiEnvelope<T> | T): T {
  let current: unknown = payload;

  while (
    isRecord(current) &&
    "data" in current &&
    ("success" in current || "timestamp" in current || "message" in current)
  ) {
    current = current.data;
  }

  return current as T;
}

export function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );
}

export function apiErrorMessage(error: unknown, fallback: string) {
  const payload = (error as AxiosError<ApiErrorPayload>)?.response?.data;
  const message = payload?.message ?? payload?.error;
  if (Array.isArray(message)) return message.join("، ");
  return message || fallback;
}
