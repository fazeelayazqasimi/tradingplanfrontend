import { motion } from 'framer-motion';
import {
  FiUserPlus, FiDollarSign, FiCheckCircle, FiUsers, FiAward, FiCopy,
  FiTrendingUp, FiShield, FiArrowRight, FiSmartphone
} from 'react-icons/fi';

const steps = [
  {
    icon: FiUserPlus,
    title: 'Register Account',
    description: 'Sign up with your details and get a unique referral code',
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    icon: FiDollarSign,
    title: 'Deposit to Wallet',
    description: 'Add funds via bank transfer, crypto, or mobile payment. Admin verifies & approves.',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  {
    icon: FiCheckCircle,
    title: 'Admin Approves Deposit',
    description: 'Admin reviews the payment proof and credits your wallet',
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    icon: FiShield,
    title: 'Purchase Subscription',
    description: 'Use wallet balance to buy $100/year membership. $30 goes to your referrer.',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
  {
    icon: FiCopy,
    title: 'Share Referral Link',
    description: 'Invite others using your unique referral code or link',
    color: 'from-rose-500 to-rose-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600'
  },
  {
    icon: FiUsers,
    title: 'Build Your Team',
    description: 'Your referrals join under you - you earn $30 per direct referral',
    color: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600'
  },
  {
    icon: FiAward,
    title: 'Climb Ranks (D1-D6)',
    description: 'More referrals & team volume unlock higher ranks with bigger commissions',
    color: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600'
  },
  {
    icon: FiTrendingUp,
    title: 'Earn More',
    description: 'Direct ($30), indirect commissions, and profit sharing from copy trading',
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SystemFlow({ compact = false }) {
  const displaySteps = compact ? steps : steps;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-ink">System Flow</h2>
        <p className="mt-2 text-sm text-dark-500 max-w-2xl mx-auto">
          How the platform works from registration to earning
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`relative ${compact ? 'grid grid-cols-2 sm:grid-cols-4 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}`}
      >
        {displaySteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              variants={itemAnim}
              className="relative group"
            >
              <div className={`h-full p-5 rounded-2xl border border-dark-100 bg-white shadow-card hover:shadow-card-md transition-all duration-300 hover:-translate-y-1 ${compact ? 'p-3' : 'p-5'}`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                  <Icon size={compact ? 18 : 20} />
                </div>
                <h3 className={`font-bold text-ink ${compact ? 'text-xs' : 'text-sm'}`}>{step.title}</h3>
                <p className={`text-dark-500 leading-relaxed ${compact ? 'text-[10px] mt-1' : 'text-xs mt-1.5'}`}>
                  {step.description}
                </p>
              </div>
              {idx < displaySteps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-dark-300">
                  <FiArrowRight size={20} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {!compact && (
        <div className="mt-10 p-6 rounded-2xl border border-primary-100 bg-primary-50/50">
          <h3 className="text-lg font-bold text-ink mb-3">Referral Earnings Example</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-dark-100 text-center">
              <p className="text-3xl font-bold text-emerald-600">$30</p>
              <p className="text-xs text-dark-500 mt-1">Per Direct Referral</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-dark-100 text-center">
              <p className="text-3xl font-bold text-blue-600">$10</p>
              <p className="text-xs text-dark-500 mt-1">Level 2 (Indirect)</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-dark-100 text-center">
              <p className="text-3xl font-bold text-purple-600">$5</p>
              <p className="text-xs text-dark-500 mt-1">Level 3+ (Indirect)</p>
            </div>
          </div>
          <p className="text-xs text-dark-400 mt-4 text-center">
            When a new user purchases a $100 subscription, the referrer earns $30 directly.
            Indirect commissions are distributed up the referral chain.
          </p>
        </div>
      )}
    </div>
  );
}
