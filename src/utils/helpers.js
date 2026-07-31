export const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const API_ORIGIN = (() => {
  const base = (import.meta.env.VITE_API_URL || '/api').trim();
  if (base.startsWith('http')) {
    try {
      const url = new URL(base);
      url.pathname = '';
      url.search = '';
      url.hash = '';
      return url.toString().replace(/\/$/, '');
    } catch { return ''; }
  }
  return '';
})();

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/uploads/') && API_ORIGIN) return `${API_ORIGIN}${path}`;
  return path;
};

export const downloadFile = async (url, filename = 'file') => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return false;
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

export const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

export const truncate = (str, len = 50) => str && str.length > len ? str.substring(0, len) + '...' : str || '';

export const getStatusColor = (status) => {
  const map = { active: 'text-emerald-600', pending: 'text-amber-600', cancelled: 'text-red-600', approved: 'text-emerald-600', rejected: 'text-red-600', paid: 'text-emerald-600', open: 'text-blue-600', closed: 'text-gray-600', resolved: 'text-emerald-600', in_progress: 'text-blue-600' };
  return map[status] || 'text-gray-600';
};

export const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
};

export const getInitials = (firstName, lastName) => {
  if (firstName) {
    const first = firstName[0] || '';
    const last = lastName ? lastName[0] : '';
    return (first + last).toUpperCase().substring(0, 2);
  }
  return '??';
};
