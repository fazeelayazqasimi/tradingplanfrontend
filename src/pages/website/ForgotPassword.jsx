import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center"><span className="text-white font-bold">TI</span></div></Link>
          <h1 className="text-2xl font-bold text-ink">Forgot Password</h1>
        </div>
        {sent ? (
          <div className="card text-center py-8"><FiMail size={48} className="text-primary-500 mx-auto mb-4" /><h2 className="text-lg font-semibold mb-2">Check Your Email</h2><p className="text-sm text-dark-500">We've sent a password reset link to your email.</p></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
            <Input label="Email" type="email" icon={FiMail} placeholder="you@example.com" {...register('email', { required: true })} />
            <Button type="submit" loading={loading} className="w-full justify-center"><FiSend /> Send Reset Link</Button>
            <p className="text-center text-sm"><Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link></p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
