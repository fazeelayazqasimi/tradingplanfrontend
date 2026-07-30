import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiInfo, FiKey, FiZap } from 'react-icons/fi';
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
  const [walletBalances, setWalletBalances] = useState({ main: 0, funding: 0 });
  const [activationInfo, setActivationInfo] = useState({ membershipPrice: 120, uplineActivationDiscount: 20, fundingPercent: 20 });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [pinCode, setPinCode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const [walletLoading, setWalletLoading] = useState(false);

  const isActivated = user?.isApproved && user?.subscriptionStatus === 'active';
  const price = activationInfo.membershipPrice;
  const fundingPercent = activationInfo.fundingPercent || 20;
  const maxFunding = Math.round((price * fundingPercent) / 100);
  const remainder = price - maxFunding;

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

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Enter an email address'); return; }
    setLoading(true);
    setError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: email });
      toast.success('Downline activated successfully!');
      refreshUser();
      setEmail('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canActivateDownline = walletBalances.funding + walletBalances.main >= price;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Account Activation</h1>
        <p className="text-sm text-dark-500 mt-1">
          {isActivated
            ? 'Activate your downline members using your wallet balance.'
            : 'Activate your account using a PIN code or wallet balance.'}
        </p>
      </div>

      {!isActivated && (
        <>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FiKey size={18} className="text-primary-500" />
              <span className="font-semibold text-ink">Activate with PIN Code</span>
            </div>

            <p className="text-sm text-dark-500">
              Enter your PIN code to activate your account instantly.
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
              <FiZap size={18} className="text-amber-500" />
              <span className="font-semibold text-ink">Activate with Wallet Balance</span>
            </div>

            <p className="text-sm text-dark-500">
              Activate instantly using your wallet balance. Cost: ${price}.
              Up to {fundingPercent}% (${maxFunding}) from your Funding Wallet; the rest from your Main Wallet.
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleActivateWithWallet}
              loading={walletLoading}
              disabled={(walletBalances.main + walletBalances.funding) < price}
            >
              <FiZap size={16} className="mr-1.5" /> Activate — ${price}
            </Button>

            <div className="text-xs text-dark-400 bg-dark-50 rounded-xl p-3 flex items-start gap-2">
              <FiInfo size={14} className="shrink-0 mt-0.5" />
              <div>
                <p><strong>Funding Wallet:</strong> ${walletBalances.funding.toFixed(2)} (max {fundingPercent}% = ${maxFunding})</p>
                <p><strong>Main Wallet:</strong> ${walletBalances.main.toFixed(2)}</p>
                {(walletBalances.main + walletBalances.funding) < price && <p className="text-red-500 mt-1">Insufficient balance. You need ${(price - walletBalances.main - walletBalances.funding).toFixed(2)} more.</p>}
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FiUsers size={18} className="text-primary-500" />
          <span className="font-semibold text-ink">Activate Downline Member</span>
        </div>

        <p className="text-sm text-dark-500">
          Enter your downline's email to activate them. Full charge: ${price}. You can use up to {fundingPercent}% (${maxFunding}) from your Funding Wallet; the rest comes from your Main Wallet.
        </p>

        <Input
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="Downline email"
          error={error}
        />

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          loading={loading}
          disabled={!canActivateDownline}
        >
          Activate — ${price}
        </Button>

        <div className="text-xs text-dark-400 bg-dark-50 rounded-xl p-3 flex items-start gap-2">
          <FiInfo size={14} className="shrink-0 mt-0.5" />
          <div>
            <p><strong>Funding Wallet:</strong> ${walletBalances.funding.toFixed(2)} (max {fundingPercent}% = ${maxFunding})</p>
            <p><strong>Main Wallet:</strong> ${walletBalances.main.toFixed(2)}</p>
            {!canActivateDownline && <p className="text-red-500 mt-1">Insufficient balance. You need ${(price - walletBalances.funding - walletBalances.main).toFixed(2)} more in your Main Wallet.</p>}
          </div>
        </div>
      </Card>
    </div>
  );
}
