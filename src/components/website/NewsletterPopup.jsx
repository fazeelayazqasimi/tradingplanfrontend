import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail } from 'react-icons/fi';
import { useName } from '../../context/NameContext';

export default function NewsletterPopup() {
  const { visitorName, setVisitorName } = useName();
  const [show, setShow] = useState(false);
  const [input, setInput] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (visitorName || dismissed) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [visitorName, dismissed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = input.trim();
    if (name) {
      setVisitorName(name);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-card-lg text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-dark-50 text-dark-400 transition-colors"
            >
              <FiX size={18} />
            </button>

            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center mx-auto mb-5">
              <FiMail className="h-7 w-7 text-white" />
            </div>

            <h2 className="text-2xl font-extrabold text-ink mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
              Welcome to Dream Trader
            </h2>
            <p className="text-dark-500 text-sm mb-6 leading-relaxed">
              Enter your name to personalize your experience and get started on your trading journey.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-[14px] border border-dark-200 bg-dark-50 px-5 py-3.5 text-[15px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white text-center"
                maxLength={50}
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-[14px] bg-ink text-white font-bold py-3.5 text-[15px] hover:bg-dark-800 transition-colors"
              >
                Get Started
              </button>
            </form>

            <button
              onClick={handleDismiss}
              className="mt-4 text-xs text-dark-400 hover:text-dark-500 transition-colors"
            >
              No thanks, continue as guest
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}