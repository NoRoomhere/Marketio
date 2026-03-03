import type { AuthError } from "firebase/auth";

const AUTH_ERROR_MAP: Record<string, string> = {
  "auth/invalid-email": "invalidEmail",
  "auth/weak-password": "weakPassword",
  "auth/email-already-in-use": "emailInUse",
  "auth/wrong-password": "wrongPassword",
  "auth/user-not-found": "userNotFound",
  "auth/network-request-failed": "networkError",
  "auth/invalid-credential": "wrongPassword",
};

export function getAuthErrorKey(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? (error as AuthError).code
      : "";
  return AUTH_ERROR_MAP[code] ?? "generic";
}
