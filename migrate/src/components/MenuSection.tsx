import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { UtensilsCrossed, Snowflake, ArrowRight } from 'lucide-react';

const categories = [
  { id: 'catering', label: 'Catering', icon: UtensilsCrossed },
  { id: 'frozen', label: 'Frozen Food', icon: Snowflake },
];

const menuItems = {
  catering: [
    {
      name: 'Paket Prasmanan Premium',
      desc: 'Buffet lengkap dengan 8-12 menu pilihan untuk acara besar Anda. Termasuk setup, dekorasi meja, dan crew pelayanan.',
      price: 'Mulai Rp 85.000/pax',
      badge: 'Best Seller',
      image: '/images/catering-prasmanan.jpg',
      features: ['Min. 100 pax', 'Setup & Crew', 'Free Tasting'],
    },
    {
      name: 'Nasi Box Eksklusif',
      desc: 'Paket nasi kotak premium dalam kemasan elegan. Cocok untuk meeting, seminar, atau acara kantor.',
      price: 'Mulai Rp 45.000/box',
      badge: 'Popular',
      image: '/images/catering-nasibox.jpg',
      features: ['Min. 50 box', 'Packaging Premium', 'Custom Menu'],
    },
  ],
  frozen: [
    {
      name: 'Dim Sum & Gyoza Collection',
      desc: 'Koleksi dim sum premium: siomay, hakao, gyoza, dan lumpia udang. Tinggal kukus 10 menit, nikmat seperti restoran.',
      price: 'Mulai Rp 35.000/pack',
      badge: 'Favorit',
      image: '/images/frozen-dimsum.jpg',
      features: ['Isi 10-12 pcs', 'Tanpa Pengawet', 'Tahan 3 Bulan'],
    },
    {
      name: 'Snack Box Frozen',
      desc: 'Risoles, pastel, kroket, dan lumpia isi ragout ayam. Tinggal goreng, sempurna untuk sajian tamu atau bekal.',
      price: 'Mulai Rp 28.000/pack',
      badge: 'New',
      image: '/images/frozen-pastry.jpg',
      features: ['Isi 8-10 pcs', 'Pre-Fried', 'Ekonomis'],
    },
  ],
};

export default function MenuSection() {
  const [activeTab, setActiveTab] = useState<'catering' | 'frozen'>('catering');
  const { ref, inView } = useInView(0.1);

  return (
    <section id="menu" className="py-20 sm:py-28 bg-cream-50" ref={ref}>
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
            <span className="text-terracotta-700 text-xs font-semibold uppercase tracking-wider">Menu Kami</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 mb-4 leading-tight">
            Pilihan Menu <span className="text-terracotta-500">Terbaik</span>
          </h2>
          <p className="text-charcoal-500 text-base sm:text-lg">
            Dari catering mewah untuk acara besar hingga frozen food praktis untuk di rumah
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-10 sm:mb-14"
        >
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg shadow-charcoal-900/5 border border-cream-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as 'catering' | 'frozen')}
                className={`flex items-center gap-2 px-5 sm:px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === cat.id
                    ? 'bg-terracotta-500 text-white shadow-md shadow-terracotta-500/25'
                    : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                <cat.icon size={18} />
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Menu Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {menuItems[activeTab].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-charcoal-900/5 hover:shadow-2xl hover:shadow-charcoal-900/10 border border-cream-200 hover:border-terracotta-200 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 via-transparent to-transparent" />
                  {item.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-terracotta-500 text-white text-xs font-bold rounded-full shadow-lg">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl">
                    <span className="text-terracotta-600 font-bold text-sm">{item.price}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7">
                  <h3 className="font-serif text-xl sm:text-2xl text-charcoal-900 mb-2 group-hover:text-terracotta-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-charcoal-500 text-sm leading-relaxed mb-5">
                    {item.desc}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-3 py-1 bg-cream-100 text-charcoal-600 text-xs font-medium rounded-lg"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={`https://wa.me/6281234567890?text=Halo%20Tameroll%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-terracotta-500 hover:text-terracotta-600 font-semibold text-sm group/link transition-colors"
                  >
                    Pesan via WhatsApp
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
