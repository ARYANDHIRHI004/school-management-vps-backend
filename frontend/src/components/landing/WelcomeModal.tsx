'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('vps_welcome_shown');
    if (!shown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('vps_welcome_shown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnquire = () => {
    setIsOpen(false);
    const el = document.getElementById('admission-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex flex-col items-center gap-2.5 mb-5">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-amber-400/50 p-0.5">
                <Image
                  src="/images/logo.jpeg"
                  alt="Vikas Public School Logo"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold font-[family-name:var(--font-heading)]">
                <Sparkles className="w-4 h-4" />
                Admissions Open 2026–27
              </span>
            </div>
            <div className="flex justify-center mb-6">
              <Image
                src="/images/illustrations/undraw_back-to-school-offers_uorw.svg"
                alt="Back to School"
                width={280}
                height={200}
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F2544] text-center font-[family-name:var(--font-heading)] mb-2">
              Welcome to Vikas Public School
            </h2>
            <p className="text-gray-500 text-center text-sm font-[family-name:var(--font-body)] mb-6 leading-relaxed">
              Give your child the gift of world-class education. Limited seats available for the upcoming academic session.
            </p>
            <button
              onClick={handleEnquire}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 py-3.5 font-semibold font-[family-name:var(--font-heading)] shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              Enquire Now →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
