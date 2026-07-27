import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import authService from '../../services/authService';

const COUNTRY_CODES = [
  { code: '+92', country: 'PK', label: 'PK (+92)' },
  { code: '+1', country: 'US', label: 'US (+1)' },
  { code: '+44', country: 'GB', label: 'UK (+44)' },
  { code: '+1', country: 'CA', label: 'CA (+1)' },
  { code: '+61', country: 'AU', label: 'AU (+61)' },
  { code: '+49', country: 'DE', label: 'DE (+49)' },
  { code: '+33', country: 'FR', label: 'FR (+33)' },
  { code: '+81', country: 'JP', label: 'JP (+81)' },
  { code: '+65', country: 'SG', label: 'SG (+65)' },
  { code: '+971', country: 'AE', label: 'AE (+971)' },
  { code: '+91', country: 'IN', label: 'IN (+91)' },
];

const OTP_TIMER = 60;

export default function Register() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const form = useForm({ defaultValues: { referralCode, phoneCode: '+92', country: 'PK' } });
  const { register: authRegister } = useAuth();
  const { getSetting } = useSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(null);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const password = form.watch('password');

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendOtp = async (data) => {
    if (otpLoading) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.sendOtp({ email: data.email });
      toast.success('Code sent to your email');
      setFormData(data);
      setStep('otp');
      setOtpCode(['', '', '', '', '', '']);
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to send code';
      toast.error(msg);
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!formData) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.sendOtp({ email: formData.email });
      toast.success('New code sent to your email');
      setOtpCode(['', '', '', '', '', '']);
      startTimer();
      otpRefs.current[0]?.focus();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to resend code';
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (step === 'form') {
      await sendOtp(data);
      return;
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
    if (!formData) return;
    setVerifyLoading(true);
    setOtpError('');
    try {
      const verifyRes = await authService.verifyOtp({ email: formData.email, otp: code });
      if (!verifyRes?.data?.success) throw new Error(verifyRes?.data?.message || 'Invalid code');

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
        phone: `${formData.phoneCode}${formData.phone}`,
        country: formData.country,
        referralCode: formData.referralCode,
      };
      await authRegister(payload);
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || err.message || 'Verification failed';
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

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(37,99,235,0.04), transparent 60%)' }}>
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
                <span className="absolute left-[4px] top-[9px] w-[3px] h-[5px] bg-white rounded-[1px]" />
                <span className="absolute left-[8px] top-[5px] w-[3px] h-[9px] bg-white rounded-[1px]" />
              </div>
              <span className="font-extrabold text-base text-ink">{getSetting('institute_name', '')}</span>
            </Link>
            <h1 className="text-xl font-extrabold text-ink">Check your email</h1>
            <p className="text-sm text-dark-500 mt-1 px-2">
              We sent a 6-digit code to <span className="font-semibold text-ink break-all">{formData?.email}</span>
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
                onClick={() => { setStep('form'); if (timerRef.current) clearInterval(timerRef.current); }}
                className="text-sm text-dark-500 hover:text-dark-700 underline"
              >
                Change email or go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(37,99,235,0.04), transparent 60%)' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
              <span className="absolute left-[4px] top-[9px] w-[3px] h-[5px] bg-white rounded-[1px]" />
              <span className="absolute left-[8px] top-[5px] w-[3px] h-[9px] bg-white rounded-[1px]" />
            </div>
            <span className="font-extrabold text-base text-ink">{getSetting('institute_name', '')}</span>
          </Link>
          <h1 className="text-xl font-extrabold text-ink">Create Account</h1>
          <p className="text-sm text-dark-500 mt-1">Start your trading journey today</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 shadow-card space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 text-sm rounded-xl border ${form.formState.errors.name ? 'border-red-400 bg-red-50' : 'border-dark-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500`}
              {...form.register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-3 py-2.5 text-sm rounded-xl border ${form.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-dark-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500`}
              {...form.register('email', { required: 'Email is required' })}
            />
            {form.formState.errors.email && <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Phone</label>
            <div className="flex gap-2">
              <select {...form.register('phoneCode')} className="w-[110px] shrink-0 px-2 py-2.5 text-sm rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white">
                {COUNTRY_CODES.map(cc => (
                  <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.label}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="300 1234567"
                className={`flex-1 px-3 py-2.5 text-sm rounded-xl border ${form.formState.errors.phone ? 'border-red-400 bg-red-50' : 'border-dark-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500`}
                {...form.register('phone', { required: 'Phone is required', minLength: { value: 7, message: 'Enter a valid phone number' } })}
              />
            </div>
            {form.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Country</label>
            <select {...form.register('country')} className="w-full px-3 py-2.5 text-sm rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white">
              <option value="">Select Country</option>
              <option value="PK">🇵🇰 Pakistan</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="FR">🇫🇷 France</option>
              <option value="JP">🇯🇵 Japan</option>
              <option value="SG">🇸🇬 Singapore</option>
              <option value="AE">🇦🇪 UAE</option>
              <option value="IN">🇮🇳 India</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Uppercase, lowercase, number, min 8"
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-xl border ${form.formState.errors.password ? 'border-red-400 bg-red-50' : 'border-dark-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500`}
                {...form.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: 'Must include uppercase, lowercase, and a number' } })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-xl border ${form.formState.errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-dark-200'} focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500`}
                {...form.register('confirmPassword', { required: 'Please confirm', validate: v => v === password || 'Passwords do not match' })}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Referral Code <span className="text-dark-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. JOHN2024"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              {...form.register('referralCode')}
            />
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {otpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Code...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-dark-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:underline font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
