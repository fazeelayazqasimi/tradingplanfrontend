import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center"><span className="text-white font-bold">TI</span></div></Link>
          <h1 className="text-2xl font-bold text-ink">Reset Password</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <Input label="New Password" type="password" icon={FiLock} placeholder="Min 8 characters" {...register('password', { required: true, minLength: 8 })} />
          <Input label="Confirm Password" type="password" icon={FiLock} placeholder="Repeat password" {...register('confirmPassword', { required: true, validate: v => v === password })} />
          <Button type="submit" loading={loading} className="w-full justify-center"><FiCheck /> Reset Password</Button>
        </form>
      </motion.div>
    </div>
  );
}
