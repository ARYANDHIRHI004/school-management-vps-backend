'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

export default function MissionVision() {
  return (
    <section id="about" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-[#0F2544] font-[family-name:var(--font-heading)]"
          >
            About Vikas Public School
          </motion.h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto font-[family-name:var(--font-body)]">
            A legacy of excellence, a vision for the future
          </p>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Principal's Desk */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/students/church-of-the-king-j9jZSqfH5YI-unsplash.jpg"
                  alt="From the Principal's Desk"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0F2544] font-[family-name:var(--font-heading)] mb-3">
                  From the Principal&apos;s Desk
                </h3>
                <p className="text-gray-600 font-[family-name:var(--font-body)] text-sm leading-relaxed mb-5">
                  &ldquo;At Vikas Public School, we believe in nurturing not just academic excellence
                  but also the character, creativity, and compassion that make our students
                  future-ready leaders. Every child who walks through our gates is a spark of
                  potential, and it is our privilege to fan that spark into a brilliant flame.&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="italic text-[#0F2544] font-[family-name:var(--font-heading)] font-semibold text-sm">
                    — Dr. Vikas Sharma
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Principal, Vikas Public School</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Mission & Vision */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 md:p-8 border border-amber-200/50 flex flex-col sm:flex-row items-start gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-200/50 rounded-xl">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F2544] font-[family-name:var(--font-heading)]">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-700 font-[family-name:var(--font-body)] text-sm leading-relaxed">
                  To provide a stimulating, inclusive learning environment that empowers every
                  child to achieve their fullest potential through innovative pedagogy,
                  values-driven education, and holistic development of mind, body, and spirit.
                </p>
              </div>
              <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 relative mx-auto sm:mx-0">
                <Image
                  src="/images/illustrations/undraw_road-to-knowledge_ufma.svg"
                  alt="Mission illustration"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 md:p-8 border border-blue-200/50 flex flex-col sm:flex-row items-start gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-200/50 rounded-xl">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F2544] font-[family-name:var(--font-heading)]">
                    Our Vision
                  </h3>
                </div>
                <p className="text-gray-700 font-[family-name:var(--font-body)] text-sm leading-relaxed">
                  To be a centre of educational excellence that nurtures globally competent,
                  ethically grounded citizens who contribute meaningfully to society — blending
                  tradition with technology, discipline with discovery, and ambition with empathy.
                </p>
              </div>
              <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 relative mx-auto sm:mx-0">
                <Image
                  src="/images/illustrations/undraw_education_3vwh.svg"
                  alt="Vision illustration"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
