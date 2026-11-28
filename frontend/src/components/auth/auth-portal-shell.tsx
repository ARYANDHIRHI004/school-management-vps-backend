"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowLeft, GraduationCap } from "lucide-react";

type AuthPortalShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  variant?: "login" | "signup";
  illustration?: string;
  /** Wider content column (e.g. student profile dashboard). */
  wide?: boolean;
};

export function AuthPortalShell({
  children,
  title,
  subtitle,
  badge = "Student & Admin Portal",
  variant = "login",
  illustration = "/images/illustrations/undraw_online-learning_tgmv.svg",
  wide = false,
}: AuthPortalShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-md backdrop-blur-md"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm ring-2 ring-amber-400/50">
              <Image
                src="/images/logo.jpeg"
                alt="Vikas Valley Vidyalay"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="block font-[family-name:var(--font-heading)] text-base font-extrabold leading-tight text-[#0F2544] lg:text-lg">
                Vikas Valley Vidyalay
              </span>
              <span className="text-[11px] font-medium tracking-wide text-amber-600">
                CBSE Affiliated • Estd. 2001
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm font-semibold text-[#0F2544]/80 transition hover:text-amber-600 sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to website
            </Link>
            <Link
              href={variant === "login" ? "/signup" : "/login"}
              className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600"
            >
              {variant === "login" ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col pt-20 lg:flex-row">
        <section className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F2544] via-[#1a3a6b] to-[#0F2544] p-10 text-white lg:flex lg:w-[44%] xl:w-[42%]">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/5" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-200 backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" />
              {badge}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 font-[family-name:var(--font-heading)] text-3xl font-extrabold leading-tight xl:text-4xl"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-md text-sm leading-relaxed text-white/80 font-[family-name:var(--font-body)]"
            >
              {subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mx-auto mt-10 w-full max-w-sm"
          >
            <Image
              src={illustration}
              alt=""
              width={400}
              height={320}
              className="mx-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          <p className="relative z-10 text-xs text-white/50">
            Secure access powered by Better Auth · Session cookies only
          </p>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full ${wide ? "max-w-3xl" : "max-w-md"}`}
          >
            <div className="mb-6 text-center lg:hidden">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[#0F2544]">
                {title}
              </h1>
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </section>
      </main>
    </div>
  );
}