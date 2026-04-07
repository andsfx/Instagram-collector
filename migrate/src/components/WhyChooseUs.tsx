import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { ShieldCheck, Clock, Truck, ThumbsUp, Sparkles, Headphones } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Bahan Berkualitas',
    desc: 'Bahan baku pilihan grade A, segar dan tanpa pengawet berbahaya.',
    color: 'bg-forest-50 text-forest-600',
  },
  {
    icon: Clock,
    title: 'Tepat Waktu',
    desc: 'Komitmen pengiriman on-time untuk setiap event tanpa kompromi.',
    color: 'bg-terracotta-50 text-terracotta-600',
  },
  {
    icon: Truck,
    title: 'Pengiriman Aman',
    desc: 'Dikemas dan dikirim dengan penanganan khusus menjaga kualitas.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ThumbsUp,
    title: 'Rasa Terjamin',
    desc: 'Resep otentik yang sudah teruji dan disukai ribuan pelanggan.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Sparkles,
    title: 'Penyajian Elegan',
    desc: 'Presentasi cantik dan profesional yang memanjakan mata.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Headphones,
    title: 'Layanan 24/7',
    desc: 'Tim support siap membantu Anda kapan saja via WhatsApp.',
    color: 'bg-rose-50 text-rose-600',
  },
];

export default function WhyChooseUs() {
  const { ref, inView } = useInView(0.1);

  return (
    <section id="keunggulan" className="py-20 sm:py-28 bg-white relative overflow-hidden" ref={ref}>
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terracotta-50 blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-forest-50 blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-200 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-forest-500" />
            <span className="text-forest-700 text-xs font-semibold uppercase tracking-wider">Mengapa Kami</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 mb-4 leading-tight">
            Kenapa Memilih <span className="text-forest-600">Tameroll</span>?
          </h2>
          <p className="text-charcoal-500 text-base sm:text-lg">
            Komitmen kami terhadap kualitas dan kepuasan pelanggan adalah yang utama
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 sm:p-8 rounded-3xl bg-cream-50/50 hover:bg-white border border-transparent hover:border-cream-200 hover:shadow-xl hover:shadow-charcoal-900/5 transition-all duration-500 cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={26} />
              </div>
              <h3 className="font-semibold text-lg text-charcoal-900 mb-2 group-hover:text-terracotta-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-charcoal-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
