'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, Users, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { src: '/images/hero/hero 1.JPG', alt: 'Campus Life' },
  { src: '/images/hero/hero 2.jpg', alt: 'Learning Together' },
  { src: '/images/hero/hero 3.JPG', alt: 'Bright Futures' },
];

const stats = [
  { icon: Award, value: 25, suffix: '+', label: 'Years of Excellence' },
  { icon: TrendingUp, value: 100, suffix: '%', label: 'Board Results' },
  { icon: Users, value: 25, suffix: ':1', label: 'Student-Teacher Ratio' },
  { icon: Cpu, value: 0, suffix: '', label: 'Smart STEM & Robotics Labs', displayText: 'Smart' },
];

type AnimatedCounterProps = {
  value: number;
  suffix: string;
  displayText?: string;
  inView: boolean;
};

function AnimatedCounter({
  value,
  suffix,
  displayText,
  inView,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || displayText) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value, displayText]);

  if (displayText) return <span>{displayText}</span>;
  return <span>{count}{suffix}</span>;
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent(index);
    startAutoPlay();
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0F2544]/90 via-[#0F2544]/60 to-transparent z-10" />

      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-2xl pl-8 md:pl-16 lg:pl-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="inline-block bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              CBSE Affiliated | Nurturing Excellence Since 2001
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-[family-name:var(--font-heading)] leading-tight mb-6">
              Empowering Young Minds for a{' '}
              <span className="text-amber-400">Brighter Tomorrow</span>
            </h1>
            <p className="text-lg text-white/80 font-[family-name:var(--font-body)] mb-8 max-w-lg">
              Where tradition meets innovation — shaping confident, compassionate, and future-ready leaders.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#campus"
                className="bg-white text-[#0F2544] rounded-full px-8 py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50 active:scale-[0.98]"
              >
                Explore Campus
              </a>
              <a
                href="#admission-form"
                className="bg-amber-500 text-white rounded-full px-8 py-3.5 font-semibold shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
              >
                Admission Enquiry
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-8 h-2.5 bg-amber-500' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-30" ref={statsRef}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border border-gray-100"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-7 h-7 text-amber-500 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-amber-500 font-[family-name:var(--font-heading)]">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  displayText={stat.displayText}
                  inView={statsInView}
                />
              </div>
              <div className="text-sm text-[#0F2544]/70 font-[family-name:var(--font-body)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
