import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import authService from '../../services/authService';
import BrandLogo from '../../components/shared/BrandLogo';

const OTP_TIMER = 300;

export default function VerifyResetOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    setTimer(OTP_TIMER);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    startTimer();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resendOtp = async () => {
    if (otpLoading) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.forgotPassword(email);
      toast.success('New code sent to your email');
      setOtpCode(['', '', '', '', '', '']);
      startTimer();
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    setOtpError('');
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d) && value) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtpCode(pasted.split(''));
      verifyOtp(pasted);
    }
  };

  const verifyOtp = async (code) => {
    if (verifyLoading) return;
    setVerifyLoading(true);
    setOtpError('');
    try {
      const res = await authService.verifyResetOtp({ email, otp: code });
      const resetToken = res?.data?.data?.resetToken;
      if (!resetToken) throw new Error(res?.data?.message || 'Verification failed');
      toast.success('OTP verified');
      navigate('/forgot-password/reset', { state: { email, resetToken } });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Verification failed';
      setOtpError(msg);
      setOtpCode(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifyLoading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(69,240,0,0.06), transparent 60%)' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <BrandLogo variant="black" showName imgClassName="h-7" nameClassName="text-base text-ink" />
          </Link>
          <h1 className="text-xl font-extrabold text-ink">Verify your email</h1>
          <p className="text-sm text-dark-500 mt-1 px-2">
            We sent a 6-digit code to <span className="font-semibold text-ink break-all">{email}</span>
          </p>
        </div>

        <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-card">
          <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
            {otpCode.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onFocus={e => e.target.select()}
                disabled={verifyLoading}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-150 ${
                  otpError ? 'border-red-400 bg-red-50' : digit ? 'border-primary-500 bg-primary-50' : 'border-dark-200 bg-white'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
              />
            ))}
          </div>

          {otpError && (
            <div className="flex items-center justify-center gap-1.5 mb-4 text-sm text-red-500">
              <FiX size={14} /> {otpError}
            </div>
          )}

          {verifyLoading && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-primary-600">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mb-4 text-sm">
            {timer > 0 ? (
              <span className="text-dark-400">
                Code expires in <span className="font-semibold text-ink">{formatTime(timer)}</span>
              </span>
            ) : (
              <span className="text-red-500 font-medium">Code expired</span>
            )}
          </div>

          <button
            type="button"
            disabled={otpLoading || timer > 0}
            onClick={resendOtp}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              otpLoading || timer > 0
                ? 'bg-dark-100 text-dark-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]'
            }`}
          >
            {otpLoading ? 'Sending...' : timer > 0 ? `Resend in ${formatTime(timer)}` : 'Request New Code'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { navigate('/forgot-password', { replace: true }); }}
              className="text-sm text-dark-500 hover:text-dark-700 underline"
            >
              Change email or go back
            </button>
            <p className="text-center text-xs text-dark-400 mt-3">
              Also check your <strong>Spam</strong> folder if you don't see the code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}