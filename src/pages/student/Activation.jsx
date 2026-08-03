import { useState, useEffect } from 'react';
import { FiKey, FiZap, FiUsers, FiCheckCircle, FiInfo, FiDollarSign } from 'react-icons/fi';
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
  const [fundingBalance, setFundingBalance] = useState(0);
  const [activationInfo, setActivationInfo] = useState({ membershipPrice: 120, uplineActivationDiscount: 0, discountAmount: 0, finalAmount: 120, fundingPercent: 20 });

  const [pinCode, setPinCode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const [walletLoading, setWalletLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isActivated = user?.isApproved && user?.subscriptionStatus === 'active';
  const price = activationInfo.finalAmount || activationInfo.membershipPrice;
  const discountAmount = activationInfo.discountAmount || 0;
  const discountPercent = activationInfo.uplineActivationDiscount || 0;
  const fundingPercent = activationInfo.fundingPercent || 20;
  const fundingPart = parseFloat((price * fundingPercent / 100).toFixed(2));
  const fundingUsed = Math.min(fundingBalance, fundingPart);
  const mainNeeded = price - fundingUsed;
  const totalAvailable = mainBalance + fundingBalance;
  const canPay = totalAvailable >= price;

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
          setFundingBalance(wallets.find(w => w.type === 'funding')?.availableBalance || 0);
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

  const PaymentSplit = ({ disabled }) => (
    <div className="space-y-2 bg-dark-50 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-500">Membership Price</span>
        <span className="text-lg font-bold text-ink">${price}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-500">Funding Wallet ({fundingPercent}%{fundingBalance < fundingPart ? ` - available $${fundingBalance.toFixed(2)}` : ''})</span>
        <span className="text-sm font-semibold text-ink">${fundingUsed.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-500">Main Wallet</span>
        <span className="text-sm font-semibold text-ink">${mainNeeded.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-dark-200 pt-2">
        <span className="text-sm text-dark-500">Total Balance Available</span>
        <span className="text-base font-bold text-ink">${totalAvailable.toFixed(2)}</span>
      </div>
      {!disabled && !canPay && (
        <div className="text-xs text-red-500 bg-red-50 rounded-lg p-2">
          Insufficient balance. You need ${(price - totalAvailable).toFixed(2)} more (funding + main wallet combined).
        </div>
      )}
    </div>
  );

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
              Activate instantly using your wallet balance. {fundingPercent}% of the <strong>${price}</strong> price is taken from your funding wallet (if available), the rest from your main wallet.
            </p>
            <PaymentSplit />
            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateWithWallet}
              loading={walletLoading}
              disabled={!canPay}
            >
              <FiDollarSign size={16} className="mr-1.5" /> Pay ${price}
            </Button>
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
               Enter your downline member's email to activate them. {fundingPercent}% of the <strong>${price}</strong> price is taken from your funding wallet (if available), the rest from your main wallet.
               {discountAmount > 0 && <span className="block mt-1 text-emerald-600 font-medium">Upline discount applied: -{discountPercent}% (-${discountAmount.toFixed(2)})</span>}
             </p>
            <Input
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Downline email"
              error={error}
            />
            <PaymentSplit disabled={!email.trim()} />
            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateDownline}
              loading={loading}
              disabled={!canPay || !email.trim()}
            >
              <FiUsers size={16} className="mr-1.5" /> Activate Downline — ${price}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
