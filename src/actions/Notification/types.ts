export interface Notification {
  id: number;
  userId: number;
  sessionScheduleId: number;
  message: string;
  seen: boolean;
  enType: number;
  type: string;
  createdAt: string;
}
