export type NotificationType =
  | "new_request"
  | "request_accepted"
  | "request_rejected";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: unknown;
  link?: string;
}
