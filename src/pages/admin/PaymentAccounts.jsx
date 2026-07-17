import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiLayers, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';

const defaultForm = {
  bankName: '', accountHolderName: '', accountNumber: '', iban: '',
  swiftCode: '', branchAddress: '', currency: 'USD',
  paymentType: 'bank_transfer', isActive: true, notes: '', order: 0
};

const paymentTypeOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'other', label: 'Other' },
];

export default function PaymentAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getPaymentAccounts();
      setAccounts(data.data || []);
    } catch {
      toast.error('Failed to load payment accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setForm({
      bankName: account.bankName || '',
      accountHolderName: account.accountHolderName || '',
      accountNumber: account.accountNumber || '',
      iban: account.iban || '',
      swiftCode: account.swiftCode || '',
      branchAddress: account.branchAddress || '',
      currency: account.currency || 'USD',
      paymentType: account.paymentType || 'bank_transfer',
      isActive: account.isActive ?? true,
      notes: account.notes || '',
      order: account.order || 0,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.bankName?.trim()) errs.bankName = 'Bank name is required';
    if (!form.accountHolderName?.trim()) errs.accountHolderName = 'Account holder name is required';
    if (!form.accountNumber?.trim()) errs.accountNumber = 'Account number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await adminService.updatePaymentAccount(editing._id, form);
        toast.success('Payment account updated');
      } else {
        await adminService.createPaymentAccount(form);
        toast.success('Payment account created');
      }
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save payment account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete payment account for ${account.bankName}?`)) return;
    try {
      await adminService.deletePaymentAccount(account._id);
      toast.success('Payment account deleted');
      fetchAccounts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    {
      header: 'Bank/Provider',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
            <FiLayers size={16} />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{row.bankName}</p>
            <p className="text-xs text-dark-400">{row.accountHolderName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Account Details',
      render: (_, row) => (
        <div>
          <p className="text-sm text-ink font-medium">{row.accountNumber}</p>
          {row.iban && <p className="text-xs text-dark-400">IBAN: {row.iban}</p>}
        </div>
      ),
    },
    {
      header: 'Type',
      render: (_, row) => (
        <Badge color={row.paymentType === 'bank_transfer' ? 'info' : row.paymentType === 'crypto' ? 'warning' : 'neutral'}>
          {row.paymentType?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Currency',
      render: (_, row) => (
        <span className="text-sm font-semibold text-ink">{row.currency}</span>
      ),
    },
    {
      header: 'Status',
      render: (_, row) => (
        <Badge color={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="rounded-xl p-2 text-dark-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
            <FiEdit2 size={15} />
          </button>
          <button onClick={() => handleDelete(row)} className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Payment Accounts</h1>
          <p className="mt-1 text-sm text-dark-500">Manage bank accounts and payment methods for deposits</p>
        </div>
        <Button onClick={openCreate}><FiPlus size={16} /> Add Account</Button>
      </div>

      <Card className="overflow-hidden">
        <DataTable columns={columns} data={accounts} loading={loading} emptyMessage="No payment accounts added yet" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payment Account' : 'Add Payment Account'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bank Name" value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} error={errors.bankName} placeholder="e.g. Chase Bank" />
            <Input label="Account Holder Name" value={form.accountHolderName} onChange={(e) => handleChange('accountHolderName', e.target.value)} error={errors.accountHolderName} placeholder="Full name on account" />
          </div>
          <Input label="Account Number / Wallet Address" value={form.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} error={errors.accountNumber} placeholder="Account number or wallet address" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="IBAN (optional)" value={form.iban} onChange={(e) => handleChange('iban', e.target.value)} placeholder="IBAN code" />
            <Input label="SWIFT Code (optional)" value={form.swiftCode} onChange={(e) => handleChange('swiftCode', e.target.value)} placeholder="SWIFT/BIC" />
          </div>
          <Input label="Branch Address (optional)" value={form.branchAddress} onChange={(e) => handleChange('branchAddress', e.target.value)} placeholder="Branch address" />
          <div className="grid grid-cols-3 gap-4">
            <Select label="Payment Type" options={paymentTypeOptions} value={form.paymentType} onChange={(e) => handleChange('paymentType', e.target.value)} />
            <Input label="Currency" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="USD" />
            <Input label="Order" type="number" value={form.order} onChange={(e) => handleChange('order', Number(e.target.value))} placeholder="0" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm text-ink font-medium">Active</span>
            </label>
          </div>
          <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Internal notes (optional)" rows={2} className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-sm text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white resize-none" />
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'} Account</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
