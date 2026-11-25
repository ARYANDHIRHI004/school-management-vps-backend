'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Phone, Mail, MapPin } from 'lucide-react';

const quickLinks = [
  { label: 'About Us', href: '/#about' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Admissions', href: '/#admission-form' },
  { label: 'Campus Life', href: '/#campus' },
  { label: 'Notices', href: '/#notices' },
  { label: 'Student Portal', href: '/login' },
];

const disclosureLinks = [
  { label: 'CBSE Affiliation', href: '#' },
  { label: 'Fee Structure', href: '#' },
  { label: 'TC Request', href: '#' },
  { label: 'Academic Calendar', href: '#' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F2544] text-white pt-16 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 — School Crest */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white/20 p-0.5 flex-shrink-0">
                <Image
                  src="/images/logo.jpeg"
                  alt="Vikas Public School Crest"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg font-[family-name:var(--font-heading)]">
                  Vikas Valley Vidyalay
                </h3>
                <p className="text-xs text-gray-400">Nurturing Excellence</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">CBSE Affiliated (Aff. No: 2100XXX)</p>
            <p className="text-sm text-gray-400 mb-5">Estd. 2001 | A Legacy of Learning</p>
            <div className="flex gap-3">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { label: 'Instagram', path: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z' },
                { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' },
                { label: 'YouTube', path: 'M12 19c-5 0-7.5-.6-8.3-1.1A2.5 2.5 0 012 15.5v-7A2.5 2.5 0 013.7 6C4.5 5.6 7 5 12 5s7.5.6 8.3 1.1A2.5 2.5 0 0122 8.5v7a2.5 2.5 0 01-1.7 2.4c-.8.4-3.3 1.1-8.3 1.1zM10 9v6l5-3-5-3z' },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className="p-2 bg-white/5 hover:bg-amber-500/20 rounded-lg transition-colors group"
                >
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-5 font-[family-name:var(--font-heading)]">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 mt-5 pt-5">
              <h4 className="text-sm font-semibold mb-3 font-[family-name:var(--font-heading)] text-gray-300">
                Mandatory Disclosure
              </h4>
              <ul className="space-y-2">
                {disclosureLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3 — School Timings */}
          <div>
            <h4 className="text-base font-semibold mb-5 font-[family-name:var(--font-heading)]">
              School Timings
            </h4>
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">Mon – Sat: 8:00 AM – 2:30 PM</p>
                  <p className="text-xs text-gray-500">Office: 9:00 AM – 4:00 PM</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-5">
              <h4 className="text-sm font-semibold mb-3 font-[family-name:var(--font-heading)] text-gray-300">
                Admissions Helpdesk
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="tel:+919876543210" className="text-amber-400 font-medium text-sm hover:text-amber-300 transition-colors">
                    +91 98765 43210
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="mailto:admissions@vikaspublicschool.edu.in" className="text-gray-400 text-sm hover:text-amber-400 transition-colors break-all">
                    admissions@vikaspublicschool.edu.in
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Help Desk: Mon–Fri, 9 AM – 5 PM</p>
            </div>
          </div>

          {/* Column 4 — Address & Map */}
          <div>
            <h4 className="text-base font-semibold mb-5 font-[family-name:var(--font-heading)]">
              Find Us
            </h4>
            <div className="flex items-start gap-3 mb-5">
              <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-400 leading-relaxed">
                123, Knowledge Lane, Education Hub,<br />
                New Delhi — 110001, India
              </p>
            </div>
            {/* Map Preview */}
            <div className="bg-white/5 rounded-xl h-36 w-full flex items-center justify-center border border-white/10 hover:border-amber-500/30 transition-colors cursor-pointer group">
              <div className="text-center">
                <span className="text-2xl block mb-1">📍</span>
                <span className="text-sm text-gray-400 group-hover:text-amber-400 transition-colors">
                  View on Google Maps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-[family-name:var(--font-body)]">
          <p>
            © 2026 Vikas Valley Vidyalay. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <p>
              Designed with ❤️ for Education
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
