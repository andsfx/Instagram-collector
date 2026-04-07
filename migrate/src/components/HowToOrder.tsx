import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { MessageCircle, ClipboardList, CreditCard, Truck } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    step: '01',
    title: 'Hubungi Kami',
    desc: 'Chat via WhatsApp untuk konsultasi menu dan kebutuhan acara Anda.',
    color: 'from-terracotta-400 to-terracotta-600',
  },
  {
    icon: ClipboardList,
    step: '02',
    title: 'Pilih Menu',
    desc: 'Tentukan paket menu, jumlah porsi, dan tanggal pengiriman.',
    color: 'from-forest-400 to-forest-600',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Konfirmasi & Bayar',
    desc: 'Lakukan pembayaran DP dan konfirmasi pesanan Anda.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Truck,
    step: '04',
    title: 'Pesanan Diantar',
    desc: 'Pesanan disiapkan dan dikirim tepat waktu ke lokasi Anda.',
    color: 'from-amber-400 to-amber-600',
  },
];

export default function HowToOrder() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="py-20 sm:py-28 bg-cream-50" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-50 border border-terracotta-200 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
            <span className="text-terracotta-700 text-xs font-semibold uppercase tracking-wider">Cara Pesan</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 mb-4 leading-tight">
            Pesan dalam <span className="text-terracotta-500">4 Langkah</span> Mudah
          </h2>
          <p className="text-charcoal-500 text-base sm:text-lg">
            Proses pemesanan yang simpel dan cepat, tanpa ribet
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative group"
            >
              {/* Connector Line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-cream-300 to-cream-200 z-0" />
              )}

              <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-8 text-center border border-cream-200 hover:border-terracotta-200 hover:shadow-xl hover:shadow-charcoal-900/5 transition-all duration-500 hover:-translate-y-1">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-charcoal-900 text-white text-xs font-bold rounded-full">
                  Step {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={28} className="text-white" />
                </div>

                <h3 className="font-semibold text-lg text-charcoal-900 mb-2">{step.title}</h3>
                <p className="text-charcoal-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
