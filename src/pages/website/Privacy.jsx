import { motion } from 'framer-motion';
export default function Privacy() {
  return (
    <div>
      <section className="bg-gradient-to-br from-dark-900 to-primary-900 text-white py-20"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl sm:text-4xl font-bold">Privacy Policy</motion.h1></div></section>
      <section className="py-16"><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose"><p className="text-dark-600">Last updated: January 2025</p>
        <h2>Information We Collect</h2><p className="text-dark-600">We collect information you provide directly, including name, email, payment information, and trading preferences.</p>
        <h2>How We Use Your Information</h2><p className="text-dark-600">We use your information to provide services, process payments, send communications, and improve our platform.</p>
        <h2>Data Security</h2><p className="text-dark-600">We implement industry-standard security measures to protect your personal information.</p>
        <h2>Contact Us</h2><p className="text-dark-600">For privacy-related inquiries, contact us at privacy@tradinginstitute.com.</p>
      </div></section>
    </div>
  );
}
