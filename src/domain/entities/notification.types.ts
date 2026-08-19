export type NotificationType = {
  _id?: string;
  id?: string;
  title?: string;
  body?: string;
  type?: string;
  data?: Record<string, unknown>;
  createdAt?: string;
};
