"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { PortalRoleToggle } from "@/components/auth/portal-role-toggle";
import { AuthField } from "@/components/auth-field";
import { useSignInMutation } from "@/hooks/mutations/use-auth-mutations";
import type { PortalIntent } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

const portalCopy: Record<
  PortalIntent,
  { title: string; hint: string; placeholder: string }
> = {
  student: {
    title: "Student portal sign in",
    hint: "Use the email and password created by the school after admission. Sign-in is verified by the API (linked admitted student).",
    placeholder: "student@school.local",
  },
  admin: {
    title: "Admin console sign in",
    hint: "Use your school admin account (created via create-admin CLI or another admin).",
    placeholder: "admin@school.local",
  },
};

export function SignInForm() {
  const portalIntent = useAuthStore((s) => s.portalIntent);
  const setPortalIntent = useAuthStore((s) => s.setPortalIntent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignInMutation();
  const copy = portalCopy[portalIntent];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn.mutate({ email, password, portalIntent });
  }

  return (
    <AuthCard>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-amber-600">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Secure portal
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[#0F2544]">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 font-[family-name:var(--font-body)]">
          {copy.hint}
        </p>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          I am signing in as
        </p>
        <PortalRoleToggle
          value={portalIntent}
          onChange={setPortalIntent}
          disabled={signIn.isPending}
        />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={copy.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {signIn.isError ? (
          <AuthMessage variant="error">
            {signIn.error instanceof Error
              ? signIn.error.message
              : "Sign-in failed"}
          </AuthMessage>
        ) : null}

        <motion.button
          type="submit"
          disabled={signIn.isPending}
          whileTap={{ scale: 0.98 }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 disabled:opacity-70 font-[family-name:var(--font-heading)]"
        >
          {signIn.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in as {portalIntent === "admin" ? "Admin" : "Student"}
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 font-[family-name:var(--font-body)]">
        New here?{" "}
        <Link
          href="/signup"
          className="font-semibold text-amber-600 underline-offset-2 hover:text-amber-700 hover:underline"
        >
          Create or request access
        </Link>
      </p>
    </AuthCard>
  );
}