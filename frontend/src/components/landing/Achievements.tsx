'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Award, Trophy, Star } from 'lucide-react';

const accreditations = [
  { icon: Shield, title: 'CBSE Affiliated', subtitle: 'Affiliation No: 2100XXX', color: 'text-[#0F2544]' },
  { icon: Award, title: 'ISO 9001:2015', subtitle: 'Quality Certified Institution', color: 'text-amber-500' },
  { icon: Trophy, title: 'Excellence Awards', subtitle: 'State Level Recognition', color: 'text-[#FB7185]' },
];

const toppers = [
  { name: 'Aarav Sharma', score: '98.4%', rank: 1, src: '/images/students/dsc07421-min-YbNqBpeKMxIDPJ7N.JPG' },
  { name: 'Priya Patel', score: '97.8%', rank: 2, src: '/images/students/dsc07479-min-dJo5ZKX8qRcKjnrl.JPG' },
  { name: 'Rohit Kumar', score: '97.2%', rank: 3, src: '/images/students/dsc08008-min-AE0aPK1q6wH1avg6.JPG' },
  { name: 'Sneha Gupta', score: '96.9%', rank: 4, src: '/images/students/dsc08012-min-Yg2qjV078ptLLaEM.JPG' },
  { name: 'Arjun Singh', score: '96.5%', rank: 5, src: '/images/students/dsc08025-min-AzG3XV5ZWxu10arE.JPG' },
  { name: 'Meera Reddy', score: '96.1%', rank: 6, src: '/images/students/dsc08033-min-YleqWVJrEPIDW9gx.JPG' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function Achievements() {
  return (
    <section id="achievements" className="bg-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2544] font-[family-name:var(--font-heading)]">
            Achievements & Recognition
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Accreditation Badges */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 mb-16"
        >
          {accreditations.map((badge, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center min-w-[200px] flex-1 max-w-[280px] hover:shadow-md transition-shadow"
            >
              <badge.icon className={`w-10 h-10 mx-auto mb-3 ${badge.color}`} />
              <h4 className="font-bold text-[#0F2544] font-[family-name:var(--font-heading)]">
                {badge.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1 font-[family-name:var(--font-body)]">
                {badge.subtitle}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Hall of Fame */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-[#0F2544] text-center mb-3 font-[family-name:var(--font-heading)] flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Hall of Fame – Our Star Performers
          </h3>
          <p className="text-gray-500 text-center text-sm mb-10 font-[family-name:var(--font-body)]">
            Board Exam 2025-26 Top Scorers
          </p>
        </motion.div>

        {/* Toppers Slider */}
        <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide px-4">
          {toppers.map((topper, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="snap-center flex-shrink-0 w-48 text-center"
            >
              <div className="relative mx-auto mb-4">
                {/* Circular Image Frame */}
                <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-amber-400 shadow-lg shadow-amber-200/50 relative">
                  <Image
                    src={topper.src}
                    alt={topper.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                {/* Rank Badge */}
                <div className="absolute -top-1 right-4 bg-amber-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                  #{topper.rank}
                </div>
              </div>
              <h4 className="font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]">
                {topper.name}
              </h4>
              <p className="text-amber-500 font-bold text-lg font-[family-name:var(--font-heading)] mt-0.5">
                {topper.score}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
