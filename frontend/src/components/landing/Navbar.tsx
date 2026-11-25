'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Campus', href: '/#campus' },
  { label: 'Notices', href: '/#notices' },
  { label: 'Achievements', href: '/#achievements' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLightPage = pathname !== '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavOpaque = scrolled || isLightPage;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isNavOpaque
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative h-11 w-11 rounded-full overflow-hidden bg-white shadow-sm ring-2 ring-amber-400/50 p-0.5 flex items-center justify-center">
              <Image
                src="/images/logo.jpeg"
                alt="Vikas Valley Vidyalay Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span
                className={`font-[family-name:var(--font-heading)] font-extrabold text-base lg:text-lg transition-colors duration-300 block leading-tight ${
                  isNavOpaque ? 'text-[#0F2544]' : 'text-white'
                }`}
              >
                Vikas Valley Vidyalay
              </span>
              <span className={`text-[11px] font-medium tracking-wide transition-colors ${
                isNavOpaque ? 'text-amber-600' : 'text-amber-300'
              }`}>
                CBSE Affiliated • Estd. 2001
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-semibold transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-amber-500'
                      : isNavOpaque
                      ? 'text-[#0F2544]/85 hover:text-amber-500'
                      : 'text-white/95 hover:text-amber-300'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-semibold transition-colors ${
                isNavOpaque
                  ? 'text-[#0F2544]/85 hover:text-amber-600'
                  : 'text-white/95 hover:text-amber-300'
              }`}
            >
              Portal
            </Link>
            <Link
              href="/#admission-form"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-2.5 font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Apply Online
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              isNavOpaque ? 'text-[#0F2544] bg-slate-100' : 'text-white bg-white/10 backdrop-blur-sm'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-slate-200"
          >
            <div className="p-6 mx-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`font-semibold text-base py-1.5 transition-colors ${
                        isActive ? 'text-amber-500 font-bold' : 'text-[#0F2544] hover:text-amber-500'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/#admission-form"
                  onClick={() => setMobileOpen(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-3 font-semibold text-center shadow-lg shadow-amber-500/25 transition-all mt-2"
                >
                  Apply Online
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
