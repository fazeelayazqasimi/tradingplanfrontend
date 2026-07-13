export const ROLES = { ADMIN: 'admin', STUDENT: 'student' };

export const RANKS = [];
export const SUBSCRIPTION_PLANS = [];

export const STATUS_COLORS = {
  active: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-danger',
  rejected: 'badge-danger',
  approved: 'badge-success',
  paid: 'badge-success',
  open: 'badge-info',
  closed: 'badge-neutral',
  resolved: 'badge-success',
  in_progress: 'badge-info',
};

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const SIGNAL_ACTIONS = ['BUY', 'SELL', 'CLOSE', 'MODIFY'];

export const TICKET_CATEGORIES = ['general', 'technical', 'billing', 'other'];
export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const NAVIGATION = {
  website: [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/courses', label: 'Courses' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ],
  student: [
    { path: '/student/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/student/courses', label: 'Courses', icon: 'courses' },
    { path: '/student/signals', label: 'Signals', icon: 'signals' },
    { path: '/student/copy-trading', label: 'Copy Trading', icon: 'copy' },
    { path: '/student/portfolio', label: 'Portfolio', icon: 'portfolio' },
    { path: '/student/wallet', label: 'Wallet', icon: 'wallet' },
    { path: '/student/referrals', label: 'Referrals', icon: 'referrals' },
    { path: '/student/rank', label: 'My Rank', icon: 'rank' },
    { path: '/student/certificates', label: 'Certificates', icon: 'cert' },
    { path: '/student/announcements', label: 'Announcements', icon: 'announce' },
    { path: '/student/support', label: 'Support', icon: 'support' },
    { path: '/student/settings', label: 'Settings', icon: 'settings' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/students', label: 'Students', icon: 'students' },
    { path: '/admin/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
    { path: '/admin/courses', label: 'Courses', icon: 'courses' },
    { path: '/admin/signals', label: 'Signals', icon: 'signals' },
    { path: '/admin/announcements', label: 'Announcements', icon: 'announce' },
    { path: '/admin/referrals', label: 'Referrals', icon: 'referrals' },
    { path: '/admin/ranks', label: 'Ranks', icon: 'rank' },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: 'wallet' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    { path: '/admin/support', label: 'Support', icon: 'support' },
  ],
};
