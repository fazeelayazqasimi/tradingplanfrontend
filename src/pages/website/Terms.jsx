import { motion } from 'framer-motion';
export default function Terms() {
  return (
    <div>
      <section className="bg-gradient-to-br from-dark-900 to-primary-900 text-white py-20"><div className="max-w-7xl mx-auto px-4"><motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold">Terms & Conditions</motion.h1></div></section>
      <section className="py-16"><div className="max-w-3xl mx-auto px-4 prose"><p className="text-dark-600">Last updated: January 2025</p>
        <h2>Acceptance of Terms</h2><p className="text-dark-600">By accessing Trading Institute, you agree to be bound by these Terms & Conditions.</p>
        <h2>Services</h2><p className="text-dark-600">We provide trading education, signals, and copy trading tools. Past performance does not guarantee future results.</p>
        <h2>Refund Policy</h2><p className="text-dark-600">7-day money-back guarantee from date of purchase.</p>
        <h2>Limitation of Liability</h2><p className="text-dark-600">Trading involves risk. We are not responsible for trading losses.</p>
      </div></section>
    </div>
  );
}
