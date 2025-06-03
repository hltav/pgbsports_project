export interface Notification {
  id: string;
  title: string;
  message: string;
  recipient: string;
  read?: boolean;
  createdAt: Date;
}
