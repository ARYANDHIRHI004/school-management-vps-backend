import { create } from "zustand";

import type { PortalIntent } from "@/lib/roles";

export type AuthUserSnapshot = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  image?: string | null;
};

type AuthStore = {
  user: AuthUserSnapshot | null;
  hydrated: boolean;
  portalIntent: PortalIntent;
  setUser: (user: AuthUserSnapshot | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setPortalIntent: (intent: PortalIntent) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  hydrated: false,
  portalIntent: "student",
  setUser: (user) => set({ user, hydrated: true }),
  setHydrated: (hydrated) => set({ hydrated }),
  setPortalIntent: (portalIntent) => set({ portalIntent }),
  clearAuth: () => set({ user: null, hydrated: true }),
}));