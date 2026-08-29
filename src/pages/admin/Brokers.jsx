import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiServer, FiCheck, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import adminService from '../../services/adminService';

export default function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBroker, setEditingBroker] = useState(null);
  const [brokerModal, setBrokerModal] = useState(false);
  const [brokerForm, setBrokerForm] = useState({ name: '', order: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountModal, setAccountModal] = useState(false);
  const [accountBrokerId, setAccountBrokerId] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', externalLink: '', description: '', order: 0 });

  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getBrokers();
      setBrokers(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load brokers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrokers(); }, [fetchBrokers]);

  const handleBrokerSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBroker) {
        await adminService.updateBroker(editingBroker._id, brokerForm);
        toast.success('Broker updated');
      } else {
        await adminService.createBroker(brokerForm);
        toast.success('Broker created');
      }
      setBrokerModal(false);
      setEditingBroker(null);
      setBrokerForm({ name: '', order: 0 });
      fetchBrokers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save broker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!editingBroker || !logoFile) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      await adminService.uploadBrokerLogo(editingBroker._id, formData);
      toast.success('Logo uploaded');
      setLogoFile(null);
      fetchBrokers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteBroker = async (broker) => {
    if (!window.confirm(`Delete broker "${broker.name}" and all its accounts?`)) return;
    try {
      await adminService.deleteBroker(broker._id);
      toast.success('Broker deleted');
      fetchBrokers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAccount) {
        await adminService.updateAccount(editingAccount.brokerId || accountBrokerId, editingAccount._id, accountForm);
        toast.success('Account updated');
      } else {
        await adminService.createAccount(accountBrokerId, accountForm);
        toast.success('Account created');
      }
      setAccountModal(false);
      setEditingAccount(null);
      setAccountForm({ name: '', externalLink: '', description: '', order: 0 });
      fetchBrokers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (brokerId, accountId) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await adminService.deleteAccount(brokerId, accountId);
      toast.success('Account deleted');
      fetchBrokers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const openAccountModal = (brokerId, account = null) => {
    setAccountBrokerId(brokerId);
    if (account) {
      setEditingAccount(account);
      setAccountForm({ name: account.name, externalLink: account.externalLink, description: account.description || '', order: account.order || 0 });
    } else {
      setEditingAccount(null);
      setAccountForm({ name: '', externalLink: '', description: '', order: 0 });
    }
    setAccountModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Trading Brokers</h1>
          <p className="mt-1 text-sm text-dark-500">Manage brokers and their trading accounts for copy trading</p>
        </div>
        <Button size="sm" onClick={() => { setEditingBroker(null); setBrokerForm({ name: '', order: 0 }); setBrokerModal(true); }}>
          <FiPlus size={16} /> Add Broker
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-40 rounded bg-dark-200" />
                <div className="h-20 rounded-xl bg-dark-100" />
              </div>
            ))}
          </div>
        </Card>
      ) : brokers.length === 0 ? (
        <Card className="p-12 text-center">
          <FiServer size={48} className="mx-auto mb-4 text-dark-300" />
          <p className="text-lg font-semibold text-ink mb-1">No brokers yet</p>
          <p className="text-sm text-dark-500">Add your first broker to get started</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {brokers.map((broker) => (
            <motion.div key={broker._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-dark-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center overflow-hidden">
                      {broker.logo ? (
                        <img src={broker.logo} alt={broker.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiServer size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">{broker.name}</h3>
                      <p className="text-xs text-dark-400">{broker.accounts?.length || 0} account(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingBroker(broker); setBrokerForm({ name: broker.name, order: broker.order || 0 }); setLogoFile(null); setBrokerModal(true); }}
                      className="p-2 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-primary-600">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteBroker(broker)}
                      className="p-2 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-red-600">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-ink">Accounts</h4>
                    <Button size="xs" variant="outline" onClick={() => openAccountModal(broker._id)}>
                      <FiPlus size={12} /> Add Account
                    </Button>
                  </div>
                  {(!broker.accounts || broker.accounts.length === 0) ? (
                    <p className="text-sm text-dark-400 text-center py-4">No accounts added yet</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {broker.accounts.map((acc) => (
                        <div key={acc._id} className="relative p-4 rounded-xl border border-dark-100 bg-dark-50/50 group hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-ink text-sm">{acc.name}</h5>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openAccountModal(broker._id, acc)}
                                className="p-1.5 rounded-lg hover:bg-white text-dark-400 hover:text-primary-600">
                                <FiEdit2 size={13} />
                              </button>
                              <button onClick={() => handleDeleteAccount(broker._id, acc._id)}
                                className="p-1.5 rounded-lg hover:bg-white text-dark-400 hover:text-red-600">
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </div>
                          {acc.description && (
                            <p className="text-xs text-dark-400 mb-2">{acc.description}</p>
                          )}
                          <a href={acc.externalLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                            Open Link <FiCheck size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={brokerModal} onClose={() => { setBrokerModal(false); setEditingBroker(null); }}
        title={editingBroker ? 'Edit Broker' : 'Add Broker'} size="sm">
        <form onSubmit={handleBrokerSubmit} className="space-y-4">
          <Input label="Broker Name" placeholder="e.g. DMA, Star Trading" value={brokerForm.name}
            onChange={(e) => setBrokerForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Display Order" type="number" placeholder="0" value={brokerForm.order}
            onChange={(e) => setBrokerForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
          {editingBroker && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Broker Logo</label>
              {editingBroker.logo && (
                <div className="flex items-center gap-3">
                  <img src={editingBroker.logo} alt={editingBroker.name} className="w-12 h-12 rounded-lg object-cover border border-dark-100" />
                  <span className="text-xs text-dark-400">Current logo</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dark-200 hover:border-primary-300 text-sm text-dark-500 hover:text-primary-600 transition-colors">
                    <FiImage size={16} /> {logoFile ? logoFile.name : 'Choose logo image'}
                  </div>
                </label>
                <Button type="button" size="sm" variant="outline" loading={uploadingLogo} onClick={handleLogoUpload} disabled={!logoFile}>
                  <FiUpload size={14} /> Upload
                </Button>
              </div>
              <p className="text-xs text-dark-400">Upload a broker logo (jpeg, png, gif, webp). Saved separately from the broker name/order.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setBrokerModal(false); setEditingBroker(null); }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingBroker ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={accountModal} onClose={() => { setAccountModal(false); setEditingAccount(null); }}
        title={editingAccount ? 'Edit Account' : 'Add Account'} size="md">
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <Input label="Account Name" placeholder="e.g. Low Risk, Medium Risk, High Risk" value={accountForm.name}
            onChange={(e) => setAccountForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="External Link (URL)" type="url" placeholder="https://..." value={accountForm.externalLink}
            onChange={(e) => setAccountForm(p => ({ ...p, externalLink: e.target.value }))} required />
          <Input label="Description (optional)" placeholder="Brief description of this account" value={accountForm.description}
            onChange={(e) => setAccountForm(p => ({ ...p, description: e.target.value }))} />
          <Input label="Display Order" type="number" placeholder="0" value={accountForm.order}
            onChange={(e) => setAccountForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setAccountModal(false); setEditingAccount(null); }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingAccount ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
