import { useState, useEffect } from 'react';
import { FiEdit2, FiPlus, FiAward, FiTrendingUp, FiPercent, FiUsers, FiTrash2, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/helpers';
import adminService from '../../services/adminService';

const RANK_COLORS = [
  { border: 'border-dark-300', bg: 'bg-dark-50', icon: 'text-dark-500', tag: 'bg-dark-100 text-dark-600' },
  { border: 'border-primary-300', bg: 'bg-primary-50', icon: 'text-primary-500', tag: 'bg-primary-50 text-primary-700' },
  { border: 'border-blue-300', bg: 'bg-blue-50', icon: 'text-blue-500', tag: 'bg-blue-50 text-blue-700' },
  { border: 'border-purple-300', bg: 'bg-purple-50', icon: 'text-purple-500', tag: 'bg-purple-50 text-purple-700' },
  { border: 'border-amber-300', bg: 'bg-amber-50', icon: 'text-amber-500', tag: 'bg-amber-50 text-amber-700' },
  { border: 'border-yellow-300', bg: 'bg-yellow-50', icon: 'text-yellow-600', tag: 'bg-yellow-50 text-yellow-700' },
];

const BAR_COLORS = ['bg-dark-400', 'bg-primary-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-yellow-500'];

const emptyRank = {
  name: '',
  minDirectReferrals: '',
  minRequiredRank: '',
  minRequiredRankCount: '',
  minTeamMembers: '',
  activationGain: '',
  quantification: '',
  indirectIncome: '',
  minReferrals: '',
  minRevenue: '',
  commissionPercent: '',
  profitSharePercent: '',
  perks: '',
};

export default function Ranks() {
  const [ranks, setRanks] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(emptyRank);
  const [editingRankId, setEditingRankId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRanks = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRanks();
      setRanks(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load ranks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistribution = async () => {
    try {
      const res = await adminService.getRankDistribution();
      setDistribution(res.data || []);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchRanks();
    fetchDistribution();
  }, []);

  const handleDelete = async (rank) => {
    if (!window.confirm(`Delete rank "${rank.name}"? This cannot be undone.`)) return;
    const rankId = rank.id || rank._id;
    try {
      setDeletingId(rankId);
      await adminService.deleteRank(rankId);
      toast.success('Rank deleted');
      fetchRanks();
      fetchDistribution();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete rank');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (rank) => {
    setEditingRankId(rank.id || rank._id || null);
    setEditData({
      name: rank.name || '',
      minDirectReferrals: rank.minDirectReferrals ?? '',
      minRequiredRank: rank.minRequiredRank || '',
      minRequiredRankCount: rank.minRequiredRankCount ?? '',
      minTeamMembers: rank.minTeamMembers ?? '',
      activationGain: rank.activationGain ?? '',
      quantification: rank.quantification ?? '',
      indirectIncome: rank.indirectIncome ?? '',
      minReferrals: rank.minReferrals ?? '',
      minRevenue: rank.minRevenue ?? '',
      commissionPercent: rank.commissionPercent ?? '',
      profitSharePercent: rank.profitSharePercent ?? '',
      perks: Array.isArray(rank.perks) ? rank.perks.join('\n') : (rank.perks || ''),
    });
    setEditModal(true);
  };

  const openCreate = () => {
    setEditingRankId(null);
    setEditData(emptyRank);
    setEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) {
      toast.error('Rank name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: editData.name.trim(),
        minDirectReferrals: Number(editData.minDirectReferrals) || 0,
        minRequiredRank: editData.minRequiredRank.trim() || null,
        minRequiredRankCount: Number(editData.minRequiredRankCount) || 0,
        minTeamMembers: Number(editData.minTeamMembers) || 0,
        activationGain: Number(editData.activationGain) || 0,
        quantification: Number(editData.quantification) || 0,
        indirectIncome: Number(editData.indirectIncome) || 0,
        minReferrals: Number(editData.minReferrals) || 0,
        minRevenue: Number(editData.minRevenue) || 0,
        commissionPercent: Number(editData.commissionPercent) || 0,
        profitSharePercent: Number(editData.profitSharePercent) || 0,
        perks: editData.perks.split('\n').map((p) => p.trim()).filter(Boolean),
      };

      if (editingRankId) {
        await adminService.updateRank(editingRankId, payload);
        toast.success('Rank updated successfully');
      } else {
        await adminService.createRank(payload);
        toast.success('Rank created successfully');
      }
      setEditModal(false);
      fetchRanks();
      fetchDistribution();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save rank');
    } finally {
      setSaving(false);
    }
  };

  const maxDistributionCount = Math.max(...distribution.map((d) => d.count || d.memberCount || 0), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Rank Management</h1>
          <p className="text-sm text-dark-500 mt-1">Manage rank tiers and their associated benefits</p>
        </div>
        <Button onClick={openCreate} icon={FiPlus} variant="primary">
          Add Rank
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card animate-pulse">
              <div className="h-6 bg-dark-200 rounded w-24 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-dark-200 rounded w-32" />
                <div className="h-4 bg-dark-200 rounded w-28" />
                <div className="h-4 bg-dark-200 rounded w-36" />
              </div>
            </div>
          ))
        ) : (
          ranks.map((rank, idx) => {
            const colors = RANK_COLORS[idx % RANK_COLORS.length];
            return (
              <div key={rank.id || rank._id || idx} className={`bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card border-l-4 ${colors.border} relative group`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-xl ${colors.bg}`}>
                    <FiAward size={22} className={colors.icon} />
                  </div>
                  <button
                    onClick={() => openEdit(rank)}
                    className="p-2 rounded-xl text-dark-400 hover:bg-dark-50 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Edit rank"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(rank)}
                    disabled={deletingId === (rank.id || rank._id)}
                    className="p-2 rounded-xl text-dark-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    title="Delete rank"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-ink">{rank.name}</h3>

                <div className="mt-5 space-y-2.5">
                  {rank.minDirectReferrals > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiUsers size={14} className="text-dark-400" />
                      <span>Direct Refer: <span className="font-medium text-dark-700">{rank.minDirectReferrals}</span></span>
                    </div>
                  )}
                  {rank.minRequiredRank && rank.minRequiredRankCount > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiAward size={14} className="text-dark-400" />
                      <span>At Least: <span className="font-medium text-dark-700">{rank.minRequiredRankCount}x {rank.minRequiredRank}</span></span>
                    </div>
                  )}
                  {rank.minTeamMembers > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiUsers size={14} className="text-dark-400" />
                      <span>Team: <span className="font-medium text-dark-700">{rank.minTeamMembers}</span></span>
                    </div>
                  )}
                  {rank.activationGain > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiDollarSign size={14} className="text-dark-400" />
                      <span>Activation: <span className="font-medium text-emerald-600">{formatCurrency(rank.activationGain)}</span></span>
                    </div>
                  )}
                  {rank.quantification > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiPercent size={14} className="text-dark-400" />
                      <span>Quantification: <span className="font-medium text-dark-700">{rank.quantification}%</span></span>
                    </div>
                  )}
                  {rank.indirectIncome > 0 && (
                    <div className="flex items-center gap-2 text-[14px] text-dark-500">
                      <FiTrendingUp size={14} className="text-dark-400" />
                      <span>Indirect Income: <span className="font-medium text-blue-600">{formatCurrency(rank.indirectIncome)}</span></span>
                    </div>
                  )}
                </div>

                {rank.perks && rank.perks.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-dark-100">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-2.5">Perks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(rank.perks) ? rank.perks : []).slice(0, 3).map((perk, i) => (
                        <span key={i} className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${colors.tag}`}>
                          {perk}
                        </span>
                      ))}
                      {rank.perks.length > 3 && (
                        <span className="text-[11px] text-dark-500">+{rank.perks.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {distribution.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink mb-6">Rank Distribution</h2>
          <div className="space-y-4">
            {distribution.map((item, idx) => {
              const count = item.count || item.memberCount || 0;
              const pct = maxDistributionCount > 0 ? (count / maxDistributionCount) * 100 : 0;
              return (
                <div key={item.rankId || item.name || idx} className="flex items-center gap-4">
                  <span className="w-24 text-[14.5px] font-medium text-dark-700 truncate">{item.name || `Rank ${idx + 1}`}</span>
                  <div className="flex-1 h-8 bg-dark-50 rounded-xl overflow-hidden">
                    <div
                      className={`h-full rounded-xl transition-all duration-500 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-[14.5px] font-semibold text-dark-700">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={editingRankId ? 'Edit Rank' : 'Create Rank'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Rank Name *</label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Diamond 1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Directly Refer</label>
              <Input
                type="number"
                min="0"
                value={editData.minDirectReferrals}
                onChange={(e) => setEditData((p) => ({ ...p, minDirectReferrals: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Min Required Rank</label>
              <Input
                value={editData.minRequiredRank}
                onChange={(e) => setEditData((p) => ({ ...p, minRequiredRank: e.target.value }))}
                placeholder="e.g. V1"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Required Rank Count</label>
              <Input
                type="number"
                min="0"
                value={editData.minRequiredRankCount}
                onChange={(e) => setEditData((p) => ({ ...p, minRequiredRankCount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Team Members</label>
              <Input
                type="number"
                min="0"
                value={editData.minTeamMembers}
                onChange={(e) => setEditData((p) => ({ ...p, minTeamMembers: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Activation Gain ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editData.activationGain}
                onChange={(e) => setEditData((p) => ({ ...p, activationGain: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Quantification %</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editData.quantification}
                onChange={(e) => setEditData((p) => ({ ...p, quantification: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Indirect Income ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editData.indirectIncome}
                onChange={(e) => setEditData((p) => ({ ...p, indirectIncome: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Perks (one per line)</label>
            <textarea
              value={editData.perks}
              onChange={(e) => setEditData((p) => ({ ...p, perks: e.target.value }))}
              rows={4}
              placeholder="Priority support&#10;Exclusive signals&#10;Personal mentor"
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="outline" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingRankId ? 'Save Changes' : 'Create Rank'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
