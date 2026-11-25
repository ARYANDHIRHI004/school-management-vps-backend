"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { redirectAfterAuth } from "@/lib/auth-routes";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { assertPortalIntentMatchesRole, type PortalIntent } from "@/lib/roles";
import { useAuthStore, type AuthUserSnapshot } from "@/stores/auth-store";

function toUserSnapshot(user: {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  image?: string | null;
}): AuthUserSnapshot {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? null,
    image: user.image ?? null,
  };
}

export function useSignInMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      portalIntent: PortalIntent;
    }) => {
      const { data, error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
      });
      if (error) throw new Error(error.message ?? "Sign-in failed");
      if (!data?.user) throw new Error("Sign-in failed");

      const user = data.user as {
        id: string;
        email: string;
        name: string;
        role?: string | null;
        image?: string | null;
      };

      try {
        assertPortalIntentMatchesRole(input.portalIntent, user.role);
      } catch (intentError) {
        await authClient.signOut();
        throw intentError;
      }

      return { user, portalIntent: input.portalIntent };
    },
    onSuccess: async ({ user, portalIntent }) => {
      const snapshot = toUserSnapshot(user);
      setUser(snapshot);
      useAuthStore.getState().setPortalIntent(portalIntent);
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await redirectAfterAuth(router, user.role);
    },
  });
}

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
    }) => {
      const { data, error } = await authClient.signUp.email(input);
      if (error) throw new Error(error.message ?? "Sign-up failed");
      if (!data?.user) throw new Error("Sign-up failed");
      return data.user as {
        id: string;
        email: string;
        name: string;
        role?: string | null;
      };
    },
    onSuccess: async (user) => {
      setUser(toUserSnapshot(user));
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await redirectAfterAuth(router, user.role);
    },
  });
}

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
      role: "admin" | "user";
    }) => {
      const { error } = await authClient.admin.createUser(input);
      if (error) throw new Error(error.message ?? "Could not create user");
      return input;
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Sign-out failed");
    },
    onSuccess: async () => {
      clearAuth();
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      window.location.assign("/");
    },
  });
}