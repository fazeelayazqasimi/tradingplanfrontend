import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import authService from '../../services/authService';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setMessage(res?.data?.message || 'Email verified successfully!');
        setStatus('success');
      } catch (err) {
        setMessage(err?.response?.data?.message || 'Verification failed. Link may be expired.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold">TI</span>
          </div>
        </Link>
        <div className="card p-8">
          {status === 'loading' && (
            <div className="py-8">
              <FiLoader size={40} className="mx-auto mb-4 text-primary-500 animate-spin" />
              <p className="text-dark-600">Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <FiCheck size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-2">Email Verified!</h2>
              <p className="text-dark-500 mb-6">{message}</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">
                Go to Login
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FiX size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-2">Verification Failed</h2>
              <p className="text-dark-500 mb-6">{message}</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
