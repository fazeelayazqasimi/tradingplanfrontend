import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const COUNTRY_CODES = [
  { code: '+92', country: 'PK', label: 'Pakistan (+92)' },
  { code: '+1', country: 'US', label: 'United States (+1)' },
  { code: '+44', country: 'UK', label: 'United Kingdom (+44)' },
  { code: '+1', country: 'CA', label: 'Canada (+1)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+33', country: 'FR', label: 'France (+33)' },
  { code: '+81', country: 'JP', label: 'Japan (+81)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+91', country: 'IN', label: 'India (+91)' },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({ defaultValues: { referralCode, phoneCode: '+92', country: 'PK' } });
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempData, setTempData] = useState(null);
  const password = watch('password');

  const sendOtp = async (data) => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to send OTP');
      toast.success('OTP sent to your email');
      setTempData(data);
      setShowOtp(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!showOtp) {
      await sendOtp(data);
      return;
    }
    setLoading(true);
    try {
      const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, otp: otpCode }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) throw new Error(verifyJson.message || 'Invalid OTP');

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: `${data.phoneCode}${data.phone}`,
        country: data.country,
        referralCode: data.referralCode,
      };
      await authRegister(payload);
      toast.success('Registration successful!');
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(37,99,235,0.04), transparent 60%)' }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
              <span className="absolute left-[5px] top-[11px] w-[4px] h-[6px] bg-white rounded-[1px]" />
              <span className="absolute left-[10px] top-[6px] w-[4px] h-[11px] bg-white rounded-[1px]" />
            </div>
            <span className="font-extrabold text-lg text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Dream Trader</span>
          </Link>
          <h1 className="text-[28px] font-extrabold text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Create Account</h1>
          <p className="text-sm text-dark-500 mt-1.5 font-inter">Start your trading journey today</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-dark-100 rounded-[18px] p-7 shadow-card space-y-4">
          <div className="field">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" className={errors.name ? 'input-error' : ''} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" className={errors.email ? 'input-error' : ''} {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="field">
            <label>Phone</label>
            <div className="flex gap-2">
              <select {...register('phoneCode')} className="input w-[130px] flex-shrink-0">
                {COUNTRY_CODES.map(cc => (
                  <option key={`${cc.code}-${cc.country}`} value={cc.code}>{cc.label}</option>
                ))}
              </select>
              <input type="tel" placeholder="300 1234567" className={`flex-1 ${errors.phone ? 'input-error' : ''}`} {...register('phone', { required: 'Phone is required', minLength: { value: 7, message: 'Enter a valid phone number' } })} />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="field">
            <label>Country</label>
            <select {...register('country')} className="input">
              <option value="">Select Country</option>
              <option value="PK">Pakistan</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="SG">Singapore</option>
              <option value="AE">UAE</option>
              <option value="IN">India</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Uppercase, lowercase, number, min 8" className={errors.password ? 'input-error' : ''} {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: 'Must include uppercase, lowercase, and a number' } })} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat password" className={errors.confirmPassword ? 'input-error' : ''} {...register('confirmPassword', { required: 'Please confirm', validate: v => v === password || 'Passwords do not match' })} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <div className="field">
            <label>Referral Code <span className="text-dark-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="e.g. JOHN2024" {...register('referralCode')} />
          </div>
          {showOtp && (
            <div className="field">
              <label>Email Verification Code</label>
              <input type="text" placeholder="Enter OTP sent to your email" maxLength={6} className="input text-center text-lg tracking-widest" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
            </div>
          )}
          <button type="submit" disabled={loading || otpLoading} className="btn-blue w-full py-3.5 text-sm font-semibold">
            {otpLoading ? 'Sending OTP...' : loading ? 'Verifying & Creating...' : showOtp ? 'Verify & Create Account' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-dark-500 font-inter">
            Already have an account? <Link to="/login" className="text-primary-500 hover:underline font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
