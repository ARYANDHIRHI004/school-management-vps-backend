'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const categories = ['All', 'Campus & Infrastructure', 'Classrooms & Labs', 'Sports & Activities'];

const galleryItems = [
  { src: '/images/campus/campus.jpeg', title: 'Main Campus Building', desc: 'Our sprawling campus with modern architecture', category: 'Campus & Infrastructure', span: 'col-span-2 row-span-2' },
  { src: '/images/campus/classroom.jpg', title: 'Smart Classroom', desc: 'Interactive digital learning spaces', category: 'Classrooms & Labs', span: '' },
  { src: '/images/campus/campus 1.jpeg', title: 'Campus Grounds', desc: 'Lush green playfields and open spaces', category: 'Campus & Infrastructure', span: '' },
  { src: '/images/campus/classroom 2.jpg', title: 'Science Classroom', desc: 'Fully equipped modern classrooms', category: 'Classrooms & Labs', span: 'col-span-2' },
  { src: '/images/campus/liabrary.jpg', title: 'Central Library', desc: 'Extensive book collection and digital resources', category: 'Classrooms & Labs', span: '' },
  { src: '/images/campus/microscope.jpg', title: 'Science Laboratory', desc: 'State-of-the-art science and research labs', category: 'Classrooms & Labs', span: '' },
  { src: '/images/campus/dsc07172-min-m7V5Kj6yv3SrKGjO.webp', title: 'Sports Activities', desc: 'World-class sports facilities for all-round development', category: 'Sports & Activities', span: 'col-span-2' },
  { src: '/images/campus/8677087b-d9c0-4893-94cc-8bcc3539e7c8.jpeg', title: 'School Entrance', desc: 'Grand entrance to our academic campus', category: 'Campus & Infrastructure', span: '' },
];

export default function CampusGallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    const newIndex = (lightbox + dir + filtered.length) % filtered.length;
    setLightbox(newIndex);
  };

  return (
    <section id="campus" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2544] font-[family-name:var(--font-heading)]">
            Our Vibrant Campus
          </h2>
          <p className="text-gray-500 mt-3 font-[family-name:var(--font-body)]">
            World-class facilities designed to inspire learning and growth
          </p>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === cat
                  ? 'bg-[#0F2544] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer ${item.span}`}
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#0F2544]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <ZoomIn className="w-8 h-8 text-white/70 mb-3" />
                  <h4 className="text-white font-semibold font-[family-name:var(--font-heading)] text-base">
                    {item.title}
                  </h4>
                  <p className="text-white/70 text-xs mt-1 font-[family-name:var(--font-body)]">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            <motion.div
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[80vh] w-full aspect-video rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightbox].src}
                alt={filtered[lightbox].title}
                fill
                className="object-contain"
                sizes="80vw"
              />
            </motion.div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <h4 className="text-white font-semibold text-lg font-[family-name:var(--font-heading)]">
                {filtered[lightbox].title}
              </h4>
              <p className="text-white/60 text-sm mt-1">{filtered[lightbox].desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
