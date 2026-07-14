import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import WebsiteLayout from './components/layouts/WebsiteLayout';
import AdminLayout from './components/layouts/AdminLayout';
import StudentLayout from './components/layouts/StudentLayout';
import NotFound from './pages/NotFound';

import Home from './pages/website/Home';
import About from './pages/website/About';
import CoursesPage from './pages/website/Courses';
import Pricing from './pages/website/Pricing';
import FAQ from './pages/website/FAQ';
import Contact from './pages/website/Contact';
import Login from './pages/website/Login';
import Register from './pages/website/Register';
import ForgotPassword from './pages/website/ForgotPassword';
import ResetPassword from './pages/website/ResetPassword';
import Privacy from './pages/website/Privacy';
import Terms from './pages/website/Terms';
import OnsiteTraining from './pages/website/OnsiteTraining';
import TradingSignals from './pages/website/TradingSignals';
import CopyTradingPublic from './pages/website/CopyTrading';
import ReferralProgramPublic from './pages/website/ReferralProgram';
import TradingCalculators from './pages/website/TradingCalculators';
import Tools from './pages/website/Tools';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminCourses from './pages/admin/Courses';
import AdminSignals from './pages/admin/Signals';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminReferrals from './pages/admin/Referrals';
import AdminRanks from './pages/admin/Ranks';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminSettings from './pages/admin/Settings';
import AdminSupport from './pages/admin/Support';
import AdminFAQs from './pages/admin/FAQs';
import AdminContent from './pages/admin/Content';
import AdminAssignments from './pages/admin/Assignments';
import AdminQuizzes from './pages/admin/Quizzes';
import AdminCertificates from './pages/admin/Certificates';
import AdminWallets from './pages/admin/Wallets';
import AdminReports from './pages/admin/Reports';

import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentSignals from './pages/student/Signals';
import StudentCopyTrading from './pages/student/CopyTrading';
import StudentPortfolio from './pages/student/Portfolio';
import StudentWallet from './pages/student/Wallet';
import StudentReferrals from './pages/student/Referrals';
import StudentRank from './pages/student/Rank';
import StudentCertificates from './pages/student/Certificates';
import StudentAnnouncements from './pages/student/Announcements';
import StudentSupport from './pages/student/Support';
import StudentSettings from './pages/student/Settings';
import StudentSubscription from './pages/student/Subscription';
import StudentTransactions from './pages/student/Transactions';
import StudentWithdrawals from './pages/student/Withdrawals';
import StudentTeamMembers from './pages/student/TeamMembers';
import StudentProfitShare from './pages/student/ProfitShare';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'onsite-training', element: <OnsiteTraining /> },
      { path: 'trading-signals', element: <TradingSignals /> },
      { path: 'copy-trading', element: <CopyTradingPublic /> },
      { path: 'referral-program', element: <ReferralProgramPublic /> },
      { path: 'calculators', element: <TradingCalculators /> },
      { path: 'tools', element: <Tools /> },
    ],
  },
  { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
  { path: '/register', element: <GuestRoute><Register /></GuestRoute> },
  { path: '/forgot-password', element: <GuestRoute><ForgotPassword /></GuestRoute> },
  { path: '/reset-password/:token', element: <GuestRoute><ResetPassword /></GuestRoute> },
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'subscriptions', element: <AdminSubscriptions /> },
      { path: 'courses', element: <AdminCourses /> },
      { path: 'signals', element: <AdminSignals /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'referrals', element: <AdminReferrals /> },
      { path: 'ranks', element: <AdminRanks /> },
      { path: 'withdrawals', element: <AdminWithdrawals /> },
      { path: 'faqs', element: <AdminFAQs /> },
      { path: 'content', element: <AdminContent /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'support', element: <AdminSupport /> },
      { path: 'assignments', element: <AdminAssignments /> },
      { path: 'quizzes', element: <AdminQuizzes /> },
      { path: 'certificates', element: <AdminCertificates /> },
      { path: 'wallets', element: <AdminWallets /> },
      { path: 'reports', element: <AdminReports /> },
    ],
  },
  {
    path: '/student',
    element: <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'courses', element: <StudentCourses /> },
      { path: 'courses/:slug', element: <StudentCourseDetail /> },
      { path: 'signals', element: <StudentSignals /> },
      { path: 'copy-trading', element: <StudentCopyTrading /> },
      { path: 'portfolio', element: <StudentPortfolio /> },
      { path: 'wallet', element: <StudentWallet /> },
      { path: 'referrals', element: <StudentReferrals /> },
      { path: 'rank', element: <StudentRank /> },
      { path: 'certificates', element: <StudentCertificates /> },
      { path: 'announcements', element: <StudentAnnouncements /> },
      { path: 'support', element: <StudentSupport /> },
      { path: 'settings', element: <StudentSettings /> },
      { path: 'subscription', element: <StudentSubscription /> },
      { path: 'transactions', element: <StudentTransactions /> },
      { path: 'withdrawals', element: <StudentWithdrawals /> },
      { path: 'team', element: <StudentTeamMembers /> },
      { path: 'profit-share', element: <StudentProfitShare /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
