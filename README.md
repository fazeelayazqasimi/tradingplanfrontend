# Dream Trader - Trading Institute Management System (Frontend)

A modern, responsive single-page application for managing trading education, built with React, Vite, and TailwindCSS.

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6 (BrowserRouter)
- **Forms**: React Hook Form
- **State**: React Context API
- **HTTP**: Axios with interceptors
- **Icons**: React Icons (Feather)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── WebsiteLayout.jsx    # Public site layout with navbar + footer
│   │   │   ├── AdminLayout.jsx      # Admin dashboard layout with sidebar
│   │   │   └── StudentLayout.jsx    # Student dashboard layout with sidebar
│   │   └── ui/
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── DataTable.jsx
│   │       ├── EmptyState.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Pagination.jsx
│   │       ├── Select.jsx
│   │       └── Skeleton.jsx
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state + login/register/logout
│   ├── hooks/
│   │   └── usePagination.js
│   ├── pages/
│   │   ├── website/                 # 15 public pages
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Privacy.jsx
│   │   │   ├── Terms.jsx
│   │   │   ├── OnsiteTraining.jsx
│   │   │   ├── TradingSignals.jsx
│   │   │   └── CopyTrading.jsx
│   │   ├── admin/                   # 18 admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Assignments.jsx
│   │   │   ├── Quizzes.jsx
│   │   │   ├── Signals.jsx
│   │   │   ├── Announcements.jsx
│   │   │   ├── Referrals.jsx
│   │   │   ├── Ranks.jsx
│   │   │   ├── Withdrawals.jsx
│   │   │   ├── Wallets.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── Support.jsx
│   │   │   ├── FAQs.jsx
│   │   │   ├── Content.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── student/                 # 18 student pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── Signals.jsx
│   │   │   ├── CopyTrading.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Wallet.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Withdrawals.jsx
│   │   │   ├── Subscription.jsx
│   │   │   ├── Referrals.jsx
│   │   │   ├── TeamMembers.jsx
│   │   │   ├── ProfitShare.jsx
│   │   │   ├── Rank.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── Announcements.jsx
│   │   │   ├── Support.jsx
│   │   │   └── Settings.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js                   # Axios instance + interceptors
│   │   ├── authService.js           # Login, register, password reset
│   │   ├── adminService.js          # Admin CRUD operations
│   │   ├── studentService.js        # Student operations
│   │   ├── courseService.js         # Course operations
│   │   ├── walletService.js         # Wallet + transactions
│   │   ├── referralService.js       # Referral tree + stats
│   │   ├── signalService.js         # Trading signals
│   │   └── websiteService.js        # Public content, FAQs, ranks
│   ├── utils/
│   │   └── helpers.js               # formatCurrency, formatDate, etc.
│   ├── App.jsx                      # All route definitions
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Environment Variables (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## Installation & Setup

```bash
npm install
npm run dev      # Start development server on port 5173
npm run build    # Production build
npm run preview  # Preview production build
```

## Pages & Features

### Public Website (15 pages)

| Page | Route | Description |
|------|-------|-------------|
| Home | / | Landing page with hero, features, stats, CTA |
| About | /about | Company info, team, statistics |
| Courses | /courses | Online education course catalog |
| Pricing | /pricing | Subscription plan comparison |
| FAQ | /faq | Frequently asked questions |
| Contact | /contact | Contact form + info |
| Login | /login | User login |
| Register | /register | User registration with referral code |
| Forgot Password | /forgot-password | Password reset request |
| Reset Password | /reset-password/:token | Password reset form |
| Privacy | /privacy | Privacy policy |
| Terms | /terms | Terms of service |
| Onsite Training | /onsite-training | In-person training programs |
| Trading Signals | /trading-signals | Signals service showcase |
| Copy Trading | /copy-trading | Copy trading service showcase |

### Admin Dashboard (18 pages)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | /admin/dashboard | Key metrics, charts, overview |
| Students | /admin/students | Manage student accounts |
| Subscriptions | /admin/subscriptions | Approve/reject subscriptions |
| Courses | /admin/courses | Course management |
| Assignments | /admin/assignments | Assignment CRUD + grading |
| Quizzes | /admin/quizzes | Quiz management |
| Signals | /admin/signals | Trading signal management |
| Announcements | /admin/announcements | Announcement management |
| Referrals | /admin/referrals | Referral tracking |
| Ranks | /admin/ranks | Rank management + overrides |
| Withdrawals | /admin/withdrawals | Withdrawal approval workflow |
| Wallets | /admin/wallets | All wallets + credit |
| Certificates | /admin/certificates | Certificate issuance |
| Support | /admin/support | Support ticket management |
| Reports | /admin/reports | Revenue charts + analytics |
| Website Content | /admin/content | CMS for public pages |
| FAQs | /admin/faqs | FAQ management |
| Settings | /admin/settings | System settings |

### Student Dashboard (18 pages)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | /student/dashboard | Personal metrics overview |
| Courses | /student/courses | Enrolled courses |
| Course Detail | /student/courses/:slug | Course content player |
| Signals | /student/signals | Trading signals feed |
| Copy Trading | /student/copy-trading | Copy trading management |
| Portfolio | /student/portfolio | Trading portfolio |
| Wallet | /student/wallet | Balance + income breakdown |
| Transactions | /student/transactions | Transaction history |
| Withdrawals | /student/withdrawals | Withdrawal requests |
| Subscription | /student/subscription | Manage subscription |
| Referrals | /student/referrals | Referral code + stats |
| Team Members | /student/team | Referral tree view |
| Profit Share | /student/profit-share | Profit distribution |
| My Rank | /student/rank | Current rank + progress |
| Certificates | /student/certificates | Earned certificates |
| Announcements | /student/announcements | Latest announcements |
| Support | /student/support | Support tickets |
| Settings | /student/settings | Profile + password |

## Key Features

- **JWT token refresh** with automatic interceptor retry
- **Role-based routing** (guest / student / admin)
- **Responsive design** — mobile-first with sidebar navigation
- **Rich data tables** with sorting, pagination, search
- **Interactive charts** — pie charts for income breakdown, bar/line charts for reports
- **Smooth animations** — Framer Motion page transitions and staggered list animations
- **Form validation** — client-side validation with error states
- **Real-time notifications** — toast messages for all actions
- **Loading states** — skeleton loaders for every data-fetching component
- **Empty states** — friendly messages when no data is available

## License

MIT
