import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import MenuSection from './components/MenuSection';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import HowToOrder from './components/HowToOrder';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import MobileBottomBar from './components/MobileBottomBar';

export default function App() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <Navbar />
      <Hero />
      <About />
      <MenuSection />
      <WhyChooseUs />
      <HowToOrder />
      <Testimonials />
      <CTASection />
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </div>
  );
}
