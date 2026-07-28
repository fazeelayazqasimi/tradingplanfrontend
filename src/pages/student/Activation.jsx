import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiKey, FiDollarSign, FiMail, FiCheckCircle, FiArrowRight, FiShield, FiPercent, FiCreditCard, FiCopy, FiZap, FiInfo, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import api from '../../services/api';
import { formatCurrency, copyToClipboard } from '../../utils/helpers';

export default function Activation() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [walletBalances, setWalletBalances] = useState({ main: 0, funding: 0 });
  const [activationInfo, setActivationInfo] = useState({ membershipPrice: 120, uplineActivationDiscount: 20, fundingPercent: 20 });
  const [activating, setActivating] = useState(false);

  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [activatingPin, setActivatingPin] = useState(false);

  const [uplineEmail, setUplineEmail] = useState('');
  const [uplineError, setUplineError] = useState('');
  const [activatingUpline, setActivatingUpline] = useState(false);

  const [downlineEmail, setDownlineEmail] = useState('');
  const [downlineError, setDownlineError] = useState('');
  const [activatingDownline, setActivatingDownline] = useState(false);

  const isActivated = user?.isApproved && user?.subscriptionStatus === 'active';
  const price = activationInfo.membershipPrice;
  const fundingPercent = activationInfo.fundingPercent || 20;
  const maxFunding = Math.round((price * fundingPercent) / 100);
  const remainder = price - maxFunding;
  const discountedPrice = Math.round(price * (100 - activationInfo.uplineActivationDiscount) / 100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, infoRes] = await Promise.allSettled([
          walletService.getAllWallets(),
          api.get('/subscriptions/activation-info'),
        ]);
        if (walletRes.status === 'fulfilled') {
          const wallets = walletRes.value?.data?.data || walletRes.value?.data || [];
          setWalletBalances({
            main: wallets.find(w => w.type === 'main')?.availableBalance || 0,
            funding: wallets.find(w => w.type === 'funding')?.availableBalance || 0,
          });
        }
        if (infoRes.status === 'fulfilled') {
          const data = infoRes.value?.data?.data || infoRes.value?.data || {};
          setActivationInfo(prev => ({ ...prev, ...data }));
        }
      } catch {}
    };
    fetchData();
  }, []);

  const handleActivateWithBalance = async () => {
    setActivating(true);
    try {
      await studentService.activateWithBalance();
      toast.success('Account activated! 🎉');
      refreshUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Insufficient balance');
    } finally {
      setActivating(false);
    }
  };

  const handleActivateWithPin = async () => {
    if (!pinCode.trim()) { setPinError('Enter PIN code'); return; }
    setActivatingPin(true);
    setPinError('');
    try {
      await studentService.activateWithPin({ code: pinCode });
      toast.success('Account activated via PIN! 🎉');
      setPinCode('');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid PIN';
      setPinError(msg);
      toast.error(msg);
    } finally {
      setActivatingPin(false);
    }
  };

  const handleActivateByUpline = async () => {
    if (!uplineEmail.trim()) { setUplineError('Enter upline email'); return; }
    setActivatingUpline(true);
    setUplineError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: uplineEmail });
      toast.success('Request sent to upline!');
      setUplineEmail('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed';
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
      toast.success('Downline activated! 🎉');
      setDownlineEmail('');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed';
      setDownlineError(msg);
      toast.error(msg);
    } finally {
      setActivatingDownline(false);
    }
  };

  const canActivateWithBalance = walletBalances.funding + walletBalances.main >= price;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500 text-white p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FiZap size={20} className="text-yellow-300" />
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                {isActivated ? 'Premium Member' : 'Activate Your Account'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
              {isActivated ? `Welcome Back, ${user?.firstName || 'Trader'}!` : `Unlock Your Trading Journey, ${user?.firstName || 'Trader'}!`}
            </h1>
            {!isActivated && (
              <p className="text-white/80 text-sm sm:text-base max-w-xl">
                Get instant access to premium signals, copy trading, advanced training & more. 
                Save up to <span className="font-bold text-yellow-300">{fundingPercent}%</span> by using your Funding Wallet!
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {isActivated && (
        <>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card variant="ocean" className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <p className="font-bold text-green-700 text-base">Account Active</p>
                <p className="text-sm text-dark-500">Your subscription is active until {user?.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}</p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FiStar className="text-primary-500" /> Activate Your Downline Member
            </h2>
            <Card className="p-6 max-w-lg">
              <div className="space-y-4">
                <p className="text-sm text-dark-500">Enter the email of your direct downline to activate their package using your wallet.</p>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-200/50 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-dark-500">Package Price</span><span className="font-bold text-ink">${price}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-dark-500">Discount ({activationInfo.uplineActivationDiscount}%)</span><span className="font-bold text-green-600">-${price - discountedPrice}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t border-primary-200"><span className="font-bold text-ink">You Pay</span><span className="font-bold text-primary-600 text-base">${discountedPrice}</span></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-400 bg-dark-50 rounded-xl p-3">
                  <FiInfo size={14} className="shrink-0" />
                  Funding: ${formatCurrency(walletBalances.funding)} &nbsp;·&nbsp; Main: ${formatCurrency(walletBalances.main)}
                </div>
                <Input value={downlineEmail} onChange={e => { setDownlineEmail(e.target.value); setDownlineError(''); }} placeholder="Downline email" error={downlineError} />
                <Button variant="primary" className="w-full" onClick={handleActivateDownline} loading={activatingDownline} disabled={walletBalances.funding + walletBalances.main < discountedPrice}>
                  <FiArrowRight className="mr-2" /> Activate Downline — ${discountedPrice}
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {!isActivated && (
        <>
          {/* Funding Discount Highlight */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 sm:p-6 border-0 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-orange-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white"><FiPercent size={16} /></div>
                  <h3 className="font-bold text-ink text-base">Exclusive Funding Wallet Benefit</h3>
                </div>
                <p className="text-sm text-dark-600 mb-4">
                  Pay up to <strong className="text-orange-600">{fundingPercent}% (${maxFunding})</strong> from your Funding Wallet. 
                  The remaining <strong className="text-primary-600">${remainder}</strong> will be deducted from your Main Wallet balance.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/70 rounded-xl px-4 py-2.5">
                    <FiCreditCard size={16} className="text-amber-500" />
                    <div><p className="text-[10px] text-dark-400 uppercase font-semibold">Funding</p><p className="text-sm font-bold text-ink">${walletBalances.funding.toFixed(2)}</p></div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 rounded-xl px-4 py-2.5">
                    <FiCreditCard size={16} className="text-primary-500" />
                    <div><p className="text-[10px] text-dark-400 uppercase font-semibold">Main</p><p className="text-sm font-bold text-ink">${walletBalances.main.toFixed(2)}</p></div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 rounded-xl px-4 py-2.5">
                    <FiDollarSign size={16} className="text-emerald-500" />
                    <div><p className="text-[10px] text-dark-400 uppercase font-semibold">Total Price</p><p className="text-sm font-bold text-ink">${price}</p></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Activation Methods */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FiShield className="text-primary-500" /> Activate Your Account
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Method 1: Wallet (Primary) */}
              <Card className="p-5 sm:col-span-3 lg:col-span-1 relative overflow-hidden border-2 border-primary-200 bg-gradient-to-b from-primary-50/50 to-white">
                <div className="absolute top-0 right-0 px-3 py-1 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">Best Deal</div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-primary-600">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white"><FiDollarSign size={18} /></div>
                    <span className="font-bold text-ink">Pay with Wallet</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-primary-100 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-dark-400">Funding Wallet ({fundingPercent}%)</span><span className="font-bold text-amber-600">— ${maxFunding}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-dark-400">Main Wallet (remaining)</span><span className="font-bold text-primary-600">— ${remainder}</span></div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-primary-100"><span className="font-bold text-ink">Total</span><span className="font-bold text-ink">${price}</span></div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleActivateWithBalance} loading={activating} disabled={!canActivateWithBalance}>
                    <FiZap className="mr-2" /> Activate Now — ${price}
                  </Button>
                  {!canActivateWithBalance && <p className="text-xs text-red-500 text-center">Insufficient balance. You need ${price - walletBalances.funding - walletBalances.main} more.</p>}
                </div>
              </Card>

              {/* Method 2: PIN Code */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white"><FiKey size={16} /></div>
                  <span className="font-bold text-ink">Enter PIN Code</span>
                </div>
                <p className="text-xs text-dark-500">Use a ${price} activation PIN code to activate instantly.</p>
                <Input value={pinCode} onChange={e => { setPinCode(e.target.value.toUpperCase()); setPinError(''); }} placeholder="Enter PIN" maxLength={20} error={pinError} />
                <Button variant="outline" size="sm" className="w-full" onClick={handleActivateWithPin} loading={activatingPin}>Activate with PIN</Button>
              </Card>

              {/* Method 3: Upline Request */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white"><FiMail size={16} /></div>
                  <span className="font-bold text-ink">Request from Upline</span>
                </div>
                <p className="text-xs text-dark-500">Ask your upline to activate your account.</p>
                <Input value={uplineEmail} onChange={e => { setUplineEmail(e.target.value); setUplineError(''); }} placeholder="Upline email" error={uplineError} />
                <Button variant="outline" size="sm" className="w-full" onClick={handleActivateByUpline} loading={activatingUpline}>Request Activation</Button>
              </Card>
            </div>
          </motion.div>

          {/* Price Breakdown */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5 bg-gradient-to-br from-dark-50 to-dark-100 border-dark-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Membership Price</p>
                  <p className="text-2xl font-extrabold text-ink">${price}</p>
                </div>
                <div className="h-10 w-px bg-dark-200 hidden sm:block" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Max from Funding ({fundingPercent}%)</p>
                  <p className="text-2xl font-extrabold text-amber-600">${maxFunding}</p>
                </div>
                <div className="h-10 w-px bg-dark-200 hidden sm:block" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">From Main Wallet</p>
                  <p className="text-2xl font-extrabold text-primary-600">${remainder}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}