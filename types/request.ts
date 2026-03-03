export type RequestStatus = "pending" | "accepted" | "rejected" | "paid";

export interface Request {
  brandUid: string;
  influencerUid: string;
  status: RequestStatus;
  budget: number;
  message: string;
  deadline: number; // days
  createdAt: unknown;
  influencerDisplayName?: string;
  brandDisplayName?: string;
}
