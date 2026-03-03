export type Role = "influencer" | "brand";

export interface UserProfile {
  role: Role;
  email: string;
  displayName: string;
  createdAt: unknown;
}
