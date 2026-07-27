import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { getSetting } = useSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data);
      toast.success('Login successful!');
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            <span className="font-extrabold text-lg text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{getSetting('institute_name', '')}</span>
          </Link>
          <h1 className="text-[28px] font-extrabold text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Welcome Back</h1>
          <p className="text-sm text-dark-500 mt-1.5 font-inter">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-dark-100 rounded-[18px] p-7 shadow-card space-y-4">
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" className={errors.email ? 'input-error' : ''} {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="field">
            <label>Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={`w-full pr-10 ${errors.password ? 'input-error' : ''}`} {...register('password', { required: 'Password is required' })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-dark-500 font-inter">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-500 hover:underline text-sm font-medium">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-blue w-full py-3.5 text-sm font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-dark-500 font-inter">
            Don't have an account? <Link to="/register" className="text-primary-500 hover:underline font-semibold">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
