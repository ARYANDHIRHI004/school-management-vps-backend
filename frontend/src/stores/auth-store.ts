import { create } from "zustand";

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
  setUser: (user: AuthUserSnapshot | null) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user, hydrated: true }),
  setHydrated: (hydrated) => set({ hydrated }),
  clearAuth: () => set({ user: null, hydrated: true }),
}));