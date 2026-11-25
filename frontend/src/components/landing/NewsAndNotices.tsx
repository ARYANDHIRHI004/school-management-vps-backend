'use client';

import { motion } from 'framer-motion';
import { Bell, Calendar, FileText, ExternalLink } from 'lucide-react';

const alerts = [
  '📢 Admissions Open for 2026-27 — Limited Seats Available',
  '🏆 100% Board Results – Class X & XII — Congratulations!',
  '📅 Annual Day Celebrations – 15th Dec 2026',
  '📝 Winter Vacation: 25th Dec – 5th Jan',
  '🎓 PTM Scheduled for 20th Nov 2026',
];

const news = [
  {
    date: 'Nov 15, 2026',
    title: 'Annual Sports Day 2026 – A Grand Success',
    excerpt: 'Students from all wings showcased exceptional talent in athletics, yoga, and team sports during the two-day annual sports extravaganza.',
    category: 'Events',
  },
  {
    date: 'Nov 10, 2026',
    title: 'STEM Innovation Fair – Top 3 Projects Selected for Nationals',
    excerpt: 'Our young innovators impressed judges with groundbreaking projects on renewable energy, AI-powered farming, and water purification systems.',
    category: 'Achievement',
  },
  {
    date: 'Nov 5, 2026',
    title: 'New Smart Classrooms Inaugurated Across All Wings',
    excerpt: 'State-of-the-art interactive smart boards and digital learning tools now equip every classroom, transforming the teaching-learning experience.',
    category: 'Infrastructure',
  },
];

const notices = [
  { date: '20', month: 'Nov', title: 'Half-Yearly Exam Schedule Released', category: 'Exam', color: 'bg-blue-100 text-blue-700' },
  { date: '18', month: 'Nov', title: 'Winter Uniform Mandatory from Dec 1', category: 'Circular', color: 'bg-purple-100 text-purple-700' },
  { date: '15', month: 'Nov', title: 'Annual Day Rehearsal Schedule', category: 'Events', color: 'bg-pink-100 text-pink-700' },
  { date: '12', month: 'Nov', title: 'Diwali Vacation: Nov 1 – Nov 5', category: 'Holiday', color: 'bg-green-100 text-green-700' },
  { date: '08', month: 'Nov', title: 'Admission Forms for 2026-27 Available', category: 'Admission', color: 'bg-amber-100 text-amber-700' },
  { date: '05', month: 'Nov', title: 'Science Olympiad Registration Open', category: 'Exam', color: 'bg-blue-100 text-blue-700' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function NewsAndNotices() {
  return (
    <section id="notices" className="pt-24 pb-16">
      {/* Marquee Ticker */}
      <div className="bg-amber-500 text-white py-2.5 overflow-hidden relative">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-4 flex items-center gap-2 bg-amber-600 py-0.5 pr-4 rounded-r-full z-10">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-semibold whitespace-nowrap">ALERTS</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...alerts, ...alerts].map((alert, i) => (
                <span key={i} className="mx-8 text-sm font-medium">
                  {alert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2544] font-[family-name:var(--font-heading)]">
            Latest News & Circulars
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — News */}
          <motion.div
            className="lg:col-span-3 flex flex-col gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {news.map((item, i) => (
              <motion.article
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#0F2544]/5 text-[#0F2544] text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-xs rounded-full px-3 py-1 font-medium">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F2544] text-lg font-[family-name:var(--font-heading)] mb-2 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-body)] leading-relaxed mb-3">
                  {item.excerpt}
                </p>
                <button className="text-amber-500 hover:text-amber-600 text-sm font-semibold flex items-center gap-1 transition-colors">
                  Read More
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </motion.article>
            ))}
          </motion.div>

          {/* Right — Notice Board */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#0F2544] text-lg font-[family-name:var(--font-heading)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Notice Board
                </h3>
                <button className="text-amber-500 hover:text-amber-600 text-sm font-semibold transition-colors">
                  View All
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto notice-scroll space-y-3 pr-2">
                {notices.map((notice, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-[#0F2544]/5 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-[#0F2544] leading-none">{notice.date}</span>
                      <span className="text-xs text-[#0F2544]/60 uppercase">{notice.month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${notice.color}`}>
                          {notice.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-[#0F2544] group-hover:text-amber-600 transition-colors truncate">
                        {notice.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
