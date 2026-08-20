import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandLogo from '../../components/shared/BrandLogo';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, resetToken } = location.state || {};

  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = watch('password');

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, resetToken, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        token: resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(69,240,0,0.06), transparent 60%)' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <BrandLogo variant="black" showName imgClassName="h-7" nameClassName="text-base text-ink" />
          </Link>
          <h1 className="text-xl font-extrabold text-ink">Reset Password</h1>
          <p className="text-sm text-dark-500 mt-1">Create a new password for your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="field">
            <label>New Password</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} icon={FiLock} placeholder="Uppercase, lowercase, number, min 8" className="pr-10" {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: 'Must include uppercase, lowercase, and a number' },
              })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <div className="relative">
              <Input type={showConfirm ? 'text' : 'password'} icon={FiLock} placeholder="Repeat password" className="pr-10" {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === password || 'Passwords do not match',
              })} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full justify-center"><FiCheck /> Reset Password</Button>
          <p className="text-center text-sm text-dark-500">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-500 hover:underline font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}