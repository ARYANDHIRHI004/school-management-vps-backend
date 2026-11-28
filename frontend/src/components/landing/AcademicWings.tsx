'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Users, CheckCircle, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const wings = [
  {
    title: 'Pre-Primary Wing',
    grades: 'Nursery to KG',
    desc: 'Play-based learning, sensory development, and foundational literacy in a nurturing environment.',
    illustration: '/images/illustrations/undraw_open-book_pet1.svg',
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    border: 'border-pink-100',
  },
  {
    title: 'Primary Wing',
    grades: 'Classes I – V',
    desc: 'Building strong foundations in academics, creativity, and social skills through interactive learning.',
    illustration: '/images/illustrations/undraw_mathematics_0j2b.svg',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    border: 'border-amber-100',
  },
  {
    title: 'Middle Wing',
    grades: 'Classes VI – VIII',
    desc: 'Critical thinking, scientific temper, and leadership skills development through experiential learning.',
    illustration: '/images/illustrations/undraw_reading-a-book_4cap.svg',
    bg: 'bg-gradient-to-br from-blue-50 to-sky-50',
    border: 'border-blue-100',
  },
  {
    title: 'Senior Secondary',
    grades: 'Classes IX – XII',
    desc: 'Board exam excellence, career guidance, and competitive exam preparation with expert faculty.',
    illustration: '/images/illustrations/undraw_online-learning_tgmv.svg',
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-100',
  },
];

const gradeOptions = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AcademicWings() {
  const [form, setForm] = useState({ name: '', grade: '', phone: '' });
  const [toast, setToast] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.phone) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch('/api/students/inquiries/public', {
        method: 'POST',
        body: JSON.stringify({
          studentName: form.name.trim(),
          intendedClass: form.grade,
          phone: form.phone.trim(),
        }),
      });
      setToast(true);
      setForm({ name: '', grade: '', phone: '' });
      setTimeout(() => setToast(false), 3500);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not submit enquiry. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="academics" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2544] font-[family-name:var(--font-heading)]">
            Academic Wings
          </h2>
          <p className="text-gray-500 mt-3 font-[family-name:var(--font-body)]">
            Comprehensive education from Pre-Primary to Senior Secondary
          </p>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Wings Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {wings.map((wing, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`${wing.bg} rounded-2xl p-6 border ${wing.border} text-center hover:shadow-lg transition-shadow duration-300 group`}
            >
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src={wing.illustration}
                  alt={wing.title}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-[#0F2544] text-lg font-[family-name:var(--font-heading)]">
                {wing.title}
              </h3>
              <p className="text-sm text-amber-600 font-medium mb-2 font-[family-name:var(--font-body)]">
                {wing.grades}
              </p>
              <p className="text-sm text-gray-600 font-[family-name:var(--font-body)] leading-relaxed">
                {wing.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Admission CTA Banner */}
        <motion.div
          id="admission-form"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 bg-gradient-to-r from-[#0F2544] to-[#1a3a6b] rounded-2xl p-8 md:p-12 overflow-hidden relative"
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left */}
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white font-[family-name:var(--font-heading)] mb-4">
                Begin Your Child&apos;s{' '}
                <span className="text-amber-400">Journey Today</span>
              </h3>
              <p className="text-white/80 font-[family-name:var(--font-body)] mb-6 leading-relaxed">
                Take the first step towards a world-class education. Fill in the enquiry form
                and our admissions team will reach out to you within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: GraduationCap, text: 'Expert Faculty' },
                  { icon: BookOpen, text: 'Modern Curriculum' },
                  { icon: Users, text: 'Small Batch Size' },
                ].map((feat, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-amber-300 rounded-full px-4 py-2 text-sm font-medium border border-white/10"
                  >
                    <feat.icon className="w-4 h-4" />
                    {feat.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20 space-y-4"
            >
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block font-[family-name:var(--font-body)]">
                  Student Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter student's full name"
                  className="w-full bg-white/90 rounded-lg px-4 py-3 text-[#0F2544] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block font-[family-name:var(--font-body)]">
                  Grade Applying For
                </label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="w-full bg-white/90 rounded-lg px-4 py-3 text-[#0F2544] focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none"
                  required
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block font-[family-name:var(--font-body)]">
                  Parent Mobile Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/90 rounded-lg px-4 py-3 text-[#0F2544] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
              {submitError && (
                <p className="text-sm text-red-200 bg-red-900/30 rounded-lg px-3 py-2" role="alert">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white rounded-full px-8 py-3.5 font-semibold shadow-lg shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Enquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white rounded-xl px-6 py-4 shadow-2xl z-[80] flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Enquiry Submitted!</p>
              <p className="text-xs text-green-100">We&apos;ll contact you within 24 hours.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
