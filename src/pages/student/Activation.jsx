import { useState, useEffect } from 'react';
import { FiKey, FiZap, FiUsers, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import api from '../../services/api';

export default function Activation() {
  const { user, refreshUser } = useAuth();
  const [mainBalance, setMainBalance] = useState(0);
  const [activationInfo, setActivationInfo] = useState({ membershipPrice: 120, uplineActivationDiscount: 20 });

  const [pinCode, setPinCode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const [walletLoading, setWalletLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isActivated = user?.isApproved && user?.subscriptionStatus === 'active';
  const price = activationInfo.membershipPrice;
  const discountPercent = activationInfo.uplineActivationDiscount || 20;
  const downlinePrice = Math.round(price * (100 - discountPercent) / 100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, infoRes] = await Promise.allSettled([
          walletService.getAllWallets(),
          api.get('/subscriptions/activation-info'),
        ]);
        if (walletRes.status === 'fulfilled') {
          const wallets = walletRes.value?.data?.data || walletRes.value?.data || [];
          setMainBalance(wallets.find(w => w.type === 'main')?.availableBalance || 0);
        }
        if (infoRes.status === 'fulfilled') {
          const data = infoRes.value?.data?.data || infoRes.value?.data || {};
          setActivationInfo(prev => ({ ...prev, ...data }));
        }
      } catch {}
    };
    fetchData();
  }, []);

  const handleActivateWithPin = async () => {
    if (!pinCode.trim()) { setPinError('Enter a PIN code'); return; }
    setPinLoading(true);
    setPinError('');
    try {
      await studentService.activateWithPin({ code: pinCode.trim() });
      toast.success('Account activated successfully via PIN!');
      refreshUser();
      setPinCode('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to activate with PIN';
      setPinError(msg);
      toast.error(msg);
    } finally {
      setPinLoading(false);
    }
  };

  const handleActivateWithWallet = async () => {
    setWalletLoading(true);
    try {
      await studentService.activateWithBalance();
      toast.success('Account activated successfully via wallet balance!');
      refreshUser();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to activate with wallet';
      toast.error(msg);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleActivateDownline = async () => {
    if (!email.trim()) { setError('Enter the downline email'); return; }
    setLoading(true);
    setError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: email });
      toast.success('Downline activated successfully!');
      setEmail('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to activate downline';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Account Activation</h1>
        <p className="text-sm text-dark-500 mt-1">
          {isActivated
            ? 'You can activate your downline members using your wallet.'
            : 'Activate your account using a PIN code or your wallet balance.'}
        </p>
      </div>

      {!isActivated ? (
        <>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                <FiKey size={16} />
              </div>
              <span className="font-semibold text-ink">Activate with PIN Code</span>
            </div>
            <p className="text-sm text-dark-500">
              Enter the PIN code you received from the admin to activate your account instantly.
            </p>
            <Input
              value={pinCode}
              onChange={e => { setPinCode(e.target.value); setPinError(''); }}
              placeholder="Enter PIN code"
              error={pinError}
            />
            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateWithPin}
              loading={pinLoading}
              disabled={!pinCode.trim()}
            >
              <FiKey size={16} className="mr-1.5" /> Activate with PIN
            </Button>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <FiZap size={16} />
              </div>
              <span className="font-semibold text-ink">Activate with Wallet</span>
            </div>
            <p className="text-sm text-dark-500">
              Activate instantly using your main wallet balance. Cost: <strong>${price}</strong>.
            </p>
            <div className="flex items-center justify-between bg-dark-50 rounded-xl px-4 py-3">
              <span className="text-sm text-dark-500">Main Wallet Balance</span>
              <span className="text-lg font-bold text-ink">${mainBalance.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateWithWallet}
              loading={walletLoading}
              disabled={mainBalance < price}
            >
              <FiZap size={16} className="mr-1.5" /> Pay ${price}
            </Button>
            {mainBalance < price && (
              <div className="text-xs text-red-500 bg-red-50 rounded-xl p-3 flex items-start gap-2">
                <FiInfo size={14} className="shrink-0 mt-0.5" />
                <span>Insufficient balance. You need ${(price - mainBalance).toFixed(2)} more in your main wallet.</span>
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </div>
              <div>
                <span className="font-semibold text-ink">Account Active</span>
                <p className="text-xs text-dark-500 mt-0.5">Your account is activated. You can now activate your downline members.</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                <FiUsers size={16} />
              </div>
              <span className="font-semibold text-ink">Activate Downline Member</span>
            </div>
            <p className="text-sm text-dark-500">
              Enter your downline member's email to activate them. You get a <strong>{discountPercent}% discount</strong> on downline activation (${downlinePrice}).
            </p>
            <Input
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Downline email"
              error={error}
            />
            <div className="flex items-center justify-between bg-dark-50 rounded-xl px-4 py-3">
              <div>
                <span className="text-sm text-dark-500">Main Wallet</span>
                <p className="text-xs text-dark-400">Balance: ${mainBalance.toFixed(2)}</p>
              </div>
              <span className="text-lg font-bold text-ink">${downlinePrice}</span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateDownline}
              loading={loading}
              disabled={mainBalance < downlinePrice || !email.trim()}
            >
              <FiUsers size={16} className="mr-1.5" /> Activate Downline — ${downlinePrice}
            </Button>
            {mainBalance < downlinePrice && (
              <div className="text-xs text-red-500 bg-red-50 rounded-xl p-3 flex items-start gap-2">
                <FiInfo size={14} className="shrink-0 mt-0.5" />
                <span>Insufficient balance. You need ${(downlinePrice - mainBalance).toFixed(2)} more in your main wallet.</span>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}