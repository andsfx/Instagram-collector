import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { Award, Heart, Leaf } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Dibuat dengan Cinta',
    desc: 'Setiap hidangan kami racik dengan passion dan dedikasi penuh dari tim chef berpengalaman.',
  },
  {
    icon: Leaf,
    title: 'Bahan Premium',
    desc: 'Hanya menggunakan bahan baku segar berkualitas tinggi tanpa pengawet berbahaya.',
  },
  {
    icon: Award,
    title: 'Standar Tertinggi',
    desc: 'Proses produksi higienis dengan standar food safety yang ketat dan terjamin.',
  },
];

export default function About() {
  const { ref, inView } = useInView(0.2);

  return (
    <section id="tentang" className="py-20 sm:py-28 bg-white" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-charcoal-900/10">
              <img
                src="/images/about-kitchen.jpg"
                alt="Chef Tameroll di dapur"
                loading="lazy"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/30 to-transparent" />
            </div>
            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-6 -right-4 sm:right-6 bg-white rounded-2xl p-5 shadow-xl shadow-charcoal-900/10 border border-cream-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center">
                  <span className="text-2xl">👨‍🍳</span>
                </div>
                <div>
                  <div className="font-serif text-xl text-charcoal-900">10+ Tahun</div>
                  <div className="text-charcoal-500 text-sm">Pengalaman</div>
                </div>
              </div>
            </motion.div>
            {/* Decorative */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl border-2 border-terracotta-200 -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-200 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
              <span className="text-forest-700 text-xs font-semibold uppercase tracking-wider">Tentang Kami</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 mb-6 leading-tight">
              Kelezatan yang{' '}
              <span className="text-terracotta-500">Tak Terlupakan</span>{' '}
              Sejak 2014
            </h2>

            <p className="text-charcoal-600 text-base sm:text-lg leading-relaxed mb-6">
              <strong className="text-charcoal-800">Tameroll</strong> hadir dengan misi menghadirkan pengalaman kuliner premium yang dapat dinikmati oleh semua kalangan. Berawal dari dapur kecil dengan passion besar, kini kami dipercaya melayani ribuan pelanggan untuk berbagai acara — dari pernikahan mewah hingga meeting kantor.
            </p>
            <p className="text-charcoal-600 text-base sm:text-lg leading-relaxed mb-10">
              Dengan lini <strong className="text-charcoal-800">frozen food</strong> kami, Anda bisa menikmati cita rasa restoran kapan saja di rumah. Praktis, higienis, dan tentunya lezat!
            </p>

            {/* Values */}
            <div className="space-y-5">
              {values.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-terracotta-50 group-hover:bg-terracotta-100 flex items-center justify-center transition-colors duration-300">
                    <item.icon size={22} className="text-terracotta-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 mb-1">{item.title}</h3>
                    <p className="text-charcoal-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
