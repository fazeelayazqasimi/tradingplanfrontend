import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiKey, FiDollarSign, FiMail, FiUsers, FiCheckCircle, FiX, FiArrowRight, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Activation() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [walletBalances, setWalletBalances] = useState({ main: 0, funding: 0 });

  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [activatingPin, setActivatingPin] = useState(false);

  const [activatingBalance, setActivatingBalance] = useState(false);

  const [uplineEmail, setUplineEmail] = useState('');
  const [uplineError, setUplineError] = useState('');
  const [activatingUpline, setActivatingUpline] = useState(false);

  const [downlineEmail, setDownlineEmail] = useState('');
  const [downlineError, setDownlineError] = useState('');
  const [activatingDownline, setActivatingDownline] = useState(false);

  const isActivated = user?.isApproved && user?.subscriptionStatus === 'active';

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await walletService.getAllWallets();
        const wallets = res?.data?.data || res?.data || [];
        const main = wallets.find(w => w.type === 'main')?.availableBalance || 0;
        const funding = wallets.find(w => w.type === 'funding')?.availableBalance || 0;
        setWalletBalances({ main, funding });
      } catch {}
    };
    fetchWallets();
  }, []);

  const handleActivateWithPin = async () => {
    if (!pinCode.trim()) { setPinError('Enter PIN code'); return; }
    setActivatingPin(true);
    setPinError('');
    try {
      await studentService.activateWithPin({ code: pinCode });
      toast.success('Account activated via PIN!');
      setPinCode('');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid or expired PIN';
      setPinError(msg);
      toast.error(msg);
    } finally {
      setActivatingPin(false);
    }
  };

  const handleActivateWithBalance = async () => {
    setActivatingBalance(true);
    try {
      await studentService.activateWithBalance();
      toast.success('Account activated via wallet!');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Insufficient balance';
      toast.error(msg);
    } finally {
      setActivatingBalance(false);
    }
  };

  const handleActivateByUpline = async () => {
    if (!uplineEmail.trim()) { setUplineError('Enter upline email'); return; }
    setActivatingUpline(true);
    setUplineError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: uplineEmail });
      toast.success('Activation request sent to upline!');
      setUplineEmail('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to request activation';
      setUplineError(msg);
      toast.error(msg);
    } finally {
      setActivatingUpline(false);
    }
  };

  const handleActivateDownline = async () => {
    if (!downlineEmail.trim()) { setDownlineError('Enter downline email'); return; }
    setActivatingDownline(true);
    setDownlineError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: downlineEmail });
      toast.success('Downline activated successfully!');
      setDownlineEmail('');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to activate downline';
      setDownlineError(msg);
      toast.error(msg);
    } finally {
      setActivatingDownline(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-lg font-bold text-ink">Account Activation</h1>
        <p className="text-sm text-dark-500 mt-0.5">
          {isActivated ? 'Your account is active. You can activate your downline members below.' : 'Activate your account to access all features.'}
        </p>
      </motion.div>

      {isActivated && (
        <motion.div variants={item}>
          <Card variant="ocean" className="p-4 flex items-center gap-3">
            <FiCheckCircle className="w-6 h-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">Account Active</p>
              <p className="text-sm text-dark-500">Your subscription is active until {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {!isActivated && (
        <>
          <motion.div variants={item}>
            <h2 className="text-base font-semibold text-ink mb-3">Activate Your Account</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-ocean-600">
                  <FiKey className="w-5 h-5" />
                  <span className="font-semibold text-ink">Enter PIN Code</span>
                </div>
                <p className="text-xs text-dark-500">Use a $120 PIN code to activate instantly.</p>
                <Input
                  value={pinCode}
                  onChange={(e) => { setPinCode(e.target.value.toUpperCase()); setPinError(''); }}
                  placeholder="Enter PIN"
                  maxLength={20}
                  error={pinError}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleActivateWithPin}
                  loading={activatingPin}
                >
                  Activate with PIN
                </Button>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-ocean-600">
                  <FiDollarSign className="w-5 h-5" />
                  <span className="font-semibold text-ink">Pay with Wallet</span>
                </div>
                <p className="text-xs text-dark-500">
                  Balance: ${walletBalances.funding.toFixed(2)} (funding) / ${walletBalances.main.toFixed(2)} (main)
                </p>
                <p className="text-xs text-dark-400">Deducted from funding then main wallet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleActivateWithBalance}
                  loading={activatingBalance}
                  disabled={walletBalances.main + walletBalances.funding < 120}
                >
                  Activate with Balance
                </Button>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-ocean-600">
                  <FiMail className="w-5 h-5" />
                  <span className="font-semibold text-ink">Request from Upline</span>
                </div>
                <p className="text-xs text-dark-500">Ask your upline to activate your account.</p>
                <Input
                  value={uplineEmail}
                  onChange={(e) => { setUplineEmail(e.target.value); setUplineError(''); }}
                  placeholder="Upline email"
                  error={uplineError}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleActivateByUpline}
                  loading={activatingUpline}
                >
                  Request Activation
                </Button>
              </Card>
            </div>
          </motion.div>
        </>
      )}

      {isActivated && (
        <motion.div variants={item}>
          <h2 className="text-base font-semibold text-ink mb-3">Activate Downline Package</h2>
          <Card className="p-5 max-w-md space-y-3">
            <div className="flex items-center gap-2 text-ocean-600">
              <FiUsers className="w-5 h-5" />
              <span className="font-semibold text-ink">Activate Your Downline Member</span>
            </div>
            <p className="text-xs text-dark-500">
              Enter the email of your direct downline member to activate their package using your wallet balance.
            </p>
            <Input
              value={downlineEmail}
              onChange={(e) => { setDownlineEmail(e.target.value); setDownlineError(''); }}
              placeholder="Downline email or name"
              error={downlineError}
            />
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleActivateDownline}
              loading={activatingDownline}
            >
              <FiArrowRight className="mr-1" /> Activate Downline
            </Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
