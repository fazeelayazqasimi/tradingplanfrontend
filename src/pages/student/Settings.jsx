import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiCamera,
  FiSave,
  FiLink,
  FiXCircle,
  FiShield,
  FiMonitor,
  FiKey,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import studentService from '../../services/studentService';
import { getInitials } from '../../utils/helpers';

const PLATFORM_OPTIONS = [
  { value: 'MT4', label: 'MetaTrader 4' },
  { value: 'MT5', label: 'MetaTrader 5' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function Settings() {
  const { user, updateUser, loadUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [mtForm, setMtForm] = useState({
    accountNumber: '',
    server: '',
    platform: 'MT4',
  });
  const [mtLoading, setMtLoading] = useState(false);

  const isMTConnected = user?.mtConnected || user?.metatrader?.connected || false;
  const mtAccount = user?.metatrader?.accountNumber || user?.mtAccount || '';

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName.trim());
      formData.append('lastName', profileForm.lastName.trim());
      formData.append('phone', profileForm.phone.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await authService.updateProfile(formData);
      await loadUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleConnectMT = async (e) => {
    e.preventDefault();
    if (!mtForm.accountNumber.trim() || !mtForm.server.trim()) {
      toast.error('Please enter account number and server');
      return;
    }
    try {
      setMtLoading(true);
      await studentService.connectMT({
        accountNumber: mtForm.accountNumber.trim(),
        server: mtForm.server.trim(),
        platform: mtForm.platform,
      });
      await loadUser();
      toast.success('MetaTrader account connected successfully');
      setMtForm({ accountNumber: '', server: '', platform: 'MT4' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to connect MetaTrader');
    } finally {
      setMtLoading(false);
    }
  };

  const handleDisconnectMT = async () => {
    try {
      setMtLoading(true);
      await studentService.disconnectMT();
      await loadUser();
      toast.success('MetaTrader account disconnected');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to disconnect');
    } finally {
      setMtLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-dark-500">
          Manage your profile, password, and platform connections
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center">
                <FiUser size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">Profile</h2>
                <p className="text-sm text-dark-500">Update your personal information</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.firstName, user?.lastName)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <FiCamera size={22} className="text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-dark-700">Profile Photo</p>
                  <p className="text-xs text-dark-400 mt-0.5">JPG, PNG. Max 5MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  icon={FiUser}
                  placeholder="First name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
                <Input
                  label="Email"
                  icon={FiMail}
                  value={user?.email || ''}
                  disabled
                  className="bg-dark-50"
                />
              </div>

              <Input
                label="Phone Number"
                icon={FiPhone}
                placeholder="+1 (555) 000-0000"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />

              <div className="flex justify-end">
                <Button type="submit" loading={savingProfile} className="gap-2">
                  <FiSave size={16} />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[42px] h-[42px] rounded-[11px] bg-amber-50 text-amber-500 flex items-center justify-center">
                <FiShield size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">Change Password</h2>
                <p className="text-sm text-dark-500">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                icon={FiLock}
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  icon={FiKey}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
                <Input
                  label="Confirm New Password"
                  icon={FiKey}
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={savingPassword} variant="secondary" className="gap-2">
                  <FiLock size={16} />
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[42px] h-[42px] rounded-[11px] bg-blue-50 text-blue-500 flex items-center justify-center">
                <FiMonitor size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">MetaTrader Connection</h2>
                <p className="text-sm text-dark-500">Connect your MetaTrader account for copy trading</p>
              </div>
            </div>

            {isMTConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[11px] bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Connected</p>
                      <p className="text-xs text-emerald-600">
                        Account: {mtAccount} | {user?.metatrader?.platform || user?.mtPlatform || 'MT4'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={mtLoading}
                    onClick={handleDisconnectMT}
                    className="gap-1.5"
                  >
                    <FiXCircle size={14} />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectMT} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Account Number"
                    icon={FiKey}
                    placeholder="e.g. 12345678"
                    value={mtForm.accountNumber}
                    onChange={(e) => setMtForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  />
                  <Input
                    label="Server"
                    icon={FiMonitor}
                    placeholder="e.g. MetaQuotes-Demo"
                    value={mtForm.server}
                    onChange={(e) => setMtForm((prev) => ({ ...prev, server: e.target.value }))}
                  />
                </div>
                <Select
                  label="Platform"
                  options={PLATFORM_OPTIONS}
                  value={mtForm.platform}
                  onChange={(e) => setMtForm((prev) => ({ ...prev, platform: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={mtLoading} className="gap-2">
                    <FiLink size={16} />
                    Connect Account
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
