"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, Send, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  useCreateUserMutation,
  useSignUpMutation,
} from "@/hooks/mutations/use-auth-mutations";
import { useSessionQuery } from "@/hooks/queries/use-session-query";
import { authPublicSignUpEnabled } from "@/lib/config";

export function SignUpForm() {
  const { data: session, isPending: sessionPending } = useSessionQuery();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";

  return (
    <div className="flex w-full flex-col gap-6">
      {authPublicSignUpEnabled ? <PublicEmailSignUp /> : <PublicSignUpDisabled />}
      {!sessionPending && isAdmin ? <AdminCreateUserForm /> : null}
      <p className="text-center text-sm text-gray-500 font-[family-name:var(--font-body)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 underline-offset-2 hover:text-amber-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function PublicSignUpDisabled() {
  return (
    <AuthCard>
      <div className="mb-3 flex items-center gap-2 text-amber-600">
        <UserPlus className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Account access
        </span>
      </div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[#0F2544]">
        Student portal accounts
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 font-[family-name:var(--font-body)]">
        After registration and admission, the school admin creates your login.
        Then use the{" "}
        <Link href="/login" className="font-semibold text-amber-600 hover:underline">
          sign-in page
        </Link>
        .
      </p>
      <AuthMessage variant="info">
        Parents: use{" "}
        <Link href="/#admission-form" className="font-semibold underline">
          admission enquiry
        </Link>{" "}
        on the home page — we will contact you within 24 hours.
      </AuthMessage>
    </AuthCard>
  );
}

function PublicEmailSignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const signUp = useSignUpMutation();
  const [clientError, setClientError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setClientError("Password must be at least 8 characters");
      return;
    }
    signUp.mutate({ name, email, password });
  }

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthCard>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[#0F2544]">
        Create account
      </h2>
      <p className="mt-2 mb-6 text-sm text-gray-600">
        For development / invited users when public sign-up is enabled.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Full name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthField
          label="Email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthField
          label="Confirm password"
          type="password"
          name="confirmPassword"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {clientError || passwordMismatch ? (
          <AuthMessage variant="error">
            {clientError ?? "Passwords do not match"}
          </AuthMessage>
        ) : null}
        {signUp.isError ? (
          <AuthMessage variant="error">
            {signUp.error instanceof Error ? signUp.error.message : "Sign-up failed"}
          </AuthMessage>
        ) : null}
        <motion.button
          type="submit"
          disabled={signUp.isPending || passwordMismatch}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F2544] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1a3a6b] disabled:opacity-70"
        >
          {signUp.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {signUp.isPending ? "Creating account…" : "Sign up"}
        </motion.button>
      </form>
    </AuthCard>
  );
}

function AdminCreateUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const createUser = useCreateUserMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return;
    createUser.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          setPassword("");
        },
      },
    );
  }

  return (
    <AuthCard tone="admin">
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        Admin: create user
      </h2>
      <p className="mt-1 mb-5 text-sm text-gray-600">
        Provision student or admin logins. Link students in the admin module after
        creation.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <AuthField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Temporary password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthSelect
          label="Role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value === "admin" ? "admin" : "user")
          }
          options={[
            { value: "user", label: "Student" },
            { value: "admin", label: "Admin" },
          ]}
        />
        {createUser.isError ? (
          <AuthMessage variant="error">
            {createUser.error instanceof Error
              ? createUser.error.message
              : "Could not create user"}
          </AuthMessage>
        ) : null}
        {createUser.isSuccess ? (
          <AuthMessage variant="success">
            Created {createUser.data?.role} account for {createUser.data?.email}.
          </AuthMessage>
        ) : null}
        <motion.button
          type="submit"
          disabled={createUser.isPending}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 disabled:opacity-70"
        >
          {createUser.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {createUser.isPending ? "Creating…" : "Create user"}
        </motion.button>
      </form>
    </AuthCard>
  );
}