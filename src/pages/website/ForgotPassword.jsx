import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandLogo from '../../components/shared/BrandLogo';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email.trim());
      toast.success('If this email is registered, an OTP has been sent.');
      navigate('/forgot-password/verify', { state: { email: data.email.trim() } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(600px 300px at 50% 20%, rgba(69,240,0,0.06), transparent 60%)' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <BrandLogo variant="black" showName imgClassName="h-7" nameClassName="text-base text-ink" />
          </Link>
          <h1 className="text-xl font-extrabold text-ink">Forgot Password</h1>
          <p className="text-sm text-dark-500 mt-1">Enter your registered email to receive an OTP</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <Input label="Email" type="email" icon={FiMail} placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
          <Button type="submit" loading={loading} className="w-full justify-center"><FiSend /> Send OTP</Button>
          <p className="text-center text-sm text-dark-500">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-500 hover:underline font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}