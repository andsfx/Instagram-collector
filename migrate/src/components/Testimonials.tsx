import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Wulandari',
    role: 'Wedding Organizer',
    text: 'Tameroll selalu jadi partner andalan kami untuk catering pernikahan. Rasa makanannya konsisten enak, penyajian cantik, dan yang paling penting selalu tepat waktu. Klien kami selalu puas!',
    rating: 5,
    avatar: '👩‍💼',
  },
  {
    name: 'Budi Santoso',
    role: 'Corporate Manager',
    text: 'Sudah 2 tahun kami menggunakan jasa catering Tameroll untuk semua event kantor. Nasi box nya selalu fresh, porsi pas, dan packaging-nya premium. Harga juga sangat kompetitif.',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    name: 'Dina Rahmawati',
    role: 'Ibu Rumah Tangga',
    text: 'Frozen food Tameroll penyelamat banget! Dim sum-nya enak seperti restoran, tinggal kukus 10 menit. Anak-anak suka banget. Selalu repeat order setiap bulan!',
    rating: 5,
    avatar: '👩‍🍳',
  },
  {
    name: 'Andi Prasetyo',
    role: 'Event Organizer',
    text: 'Sudah handle ratusan event bareng Tameroll. Dari acara 50 orang sampai 500 orang, kualitasnya selalu terjaga. The best catering partner!',
    rating: 5,
    avatar: '🧑‍💼',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useInView(0.1);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section id="testimoni" className="py-20 sm:py-28 bg-forest-800 relative overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-terracotta-500/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-forest-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
            <span className="text-cream-200 text-xs font-semibold uppercase tracking-wider">Testimoni</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            Apa Kata <span className="text-terracotta-400">Pelanggan</span> Kami
          </h2>
          <p className="text-forest-200/80 text-base sm:text-lg">
            Kepuasan pelanggan adalah kebanggaan terbesar kami
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/15">
            <Quote size={48} className="absolute top-6 right-8 text-terracotta-400/20" />

            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-8 italic">
                "{testimonials[current].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/20">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonials[current].name}</div>
                  <div className="text-forest-300/70 text-sm">{testimonials[current].role}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-terracotta-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
