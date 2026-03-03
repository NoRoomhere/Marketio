"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { getAuthInstance, getDb } from "@/lib/firebase";
import type { Role, UserProfile } from "@/types/user";
import type { BrandProfile, InfluencerProfile } from "@/types/profile";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  roleProfile: InfluencerProfile | BrandProfile | null;
  needOnboarding: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: Role
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshRoleProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleProfile, setRoleProfile] = useState<InfluencerProfile | BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const db = getDb();
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        return {
          role: data.role as Role,
          email: data.email ?? "",
          displayName: data.displayName ?? "",
          createdAt: data.createdAt,
        };
      }
    } catch (e) {
      console.error("loadProfile error:", e);
    }
    return null;
  }, []);

  const loadRoleProfile = useCallback(
    async (uid: string, role: Role): Promise<InfluencerProfile | BrandProfile | null> => {
      try {
        const db = getDb();
        const col = role === "influencer" ? "influencerProfiles" : "brandProfiles";
        const snap = await getDoc(doc(db, col, uid));
        if (snap.exists()) return snap.data() as InfluencerProfile | BrandProfile;
      } catch (e) {
        console.error("loadRoleProfile error:", e);
      }
      return null;
    },
    []
  );

  const isOnboardingComplete = useCallback(
    (rp: InfluencerProfile | BrandProfile | null, role: Role): boolean => {
      if (!rp) return false;
      if (role === "influencer") {
        const i = rp as InfluencerProfile;
        return Boolean(i.bio?.trim());
      }
      const b = rp as BrandProfile;
      return Boolean(b.companyName?.trim());
    },
    []
  );

  const refreshRoleProfile = useCallback(async () => {
    if (!user || !profile) return;
    const rp = await loadRoleProfile(user.uid, profile.role);
    setRoleProfile(rp);
  }, [user, profile, loadRoleProfile]);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser ?? null);
      if (firebaseUser) {
        const p = await loadProfile(firebaseUser.uid);
        setProfile(p);
        if (p) {
          const rp = await loadRoleProfile(firebaseUser.uid, p.role);
          setRoleProfile(rp);
        } else {
          setRoleProfile(null);
        }
      } else {
        setProfile(null);
        setRoleProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadProfile, loadRoleProfile]);

  const needOnboarding =
    Boolean(user && profile && !isOnboardingComplete(roleProfile, profile.role));

  const signIn = useCallback(
    async (email: string, password: string) => {
      const auth = getAuthInstance();
      await signInWithEmailAndPassword(auth, email, password);
      const u = auth.currentUser;
      if (u) {
        const p = await loadProfile(u.uid);
        setProfile(p);
        if (p) {
          const rp = await loadRoleProfile(u.uid, p.role);
          setRoleProfile(rp);
        }
      }
    },
    [loadProfile, loadRoleProfile]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string, role: Role) => {
      const auth = getAuthInstance();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      if (u) {
        await updateProfile(u, { displayName });
        const db = getDb();
        await setDoc(doc(db, "users", u.uid), {
          role,
          email: u.email ?? email,
          displayName,
          createdAt: serverTimestamp(),
        });
        setProfile({
          role,
          email: u.email ?? email,
          displayName,
          createdAt: null,
        });
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setRoleProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      roleProfile,
      needOnboarding,
      loading,
      signIn,
      signUp,
      signOut,
      refreshRoleProfile,
    }),
    [user, profile, roleProfile, needOnboarding, loading, signIn, signUp, signOut, refreshRoleProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
