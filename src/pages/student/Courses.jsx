import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiBookOpen,
  FiUsers,
  FiFilter,
  FiChevronRight,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiShield,
  FiCheck,
  FiPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import { COURSE_LEVELS } from '../../constants/index';
import { formatCurrency } from '../../utils/helpers';

const levelColor = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'danger',
};

const gradientPlaceholders = [
  'from-blue-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledMap, setEnrolledMap] = useState({});
  const [purchasedMap, setPurchasedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [buyModal, setBuyModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletPaying, setWalletPaying] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, perPage: 9 };
      if (search) params.search = search;
      if (levelFilter) params.level = levelFilter;

      const response = await courseService.getCourses(params);
      const body = response.data;
      const list = body.data || [];
      setCourses(Array.isArray(list) ? list : []);
      setTotalPages(body.pagination?.totalPages || Math.ceil((body.pagination?.total || 0) / 9) || 1);
      setTotalItems(body.pagination?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, search, levelFilter]);

  const fetchEnrolled = useCallback(async () => {
    try {
      const response = await courseService.getEnrolled();
      const body = response.data;
      const list = body.data || [];
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((c) => {
          map[c._id || c.id] = c;
        });
      }
      setEnrolledMap(map);
    } catch {}
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await studentService.getMyPurchases();
      const data = res?.data?.data || res?.data || [];
      const map = {};
      if (Array.isArray(data)) {
        data.forEach((p) => {
          const cid = p.courseId?._id || p.courseId;
          if (cid) map[cid] = p;
        });
      }
      setPurchasedMap(map);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchEnrolled();
  }, [fetchEnrolled]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    setPage(1);
  }, [search, levelFilter]);

  const handleEnroll = async (e, courseId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setEnrolling(courseId);
      await courseService.enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      fetchEnrolled();
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const openBuyModal = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCourse(course);
    setBuyModal(true);
    try {
      const res = await walletService.getWallet();
      setWallet(res?.data?.data || res?.data || null);
    } catch { setWallet(null); }
  };

  const handleWalletPurchase = async () => {
    if (!selectedCourse) return;
    const courseId = selectedCourse._id || selectedCourse.id;
    try {
      setWalletPaying(true);
      const res = await studentService.createPaymentIntent({
        courseId,
        broker: 'dma',
        paymentMethod: 'wallet',
      });
      toast.success('Course activated via wallet!');
      setBuyModal(false);
      fetchPurchases();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Purchase failed');
    } finally {
      setWalletPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-ink">Course Catalog</h1>
        <p className="mt-0.5 text-sm text-dark-500">
          Browse, enroll in free courses, or purchase premium courses.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={FiSearch}
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 h-full">
            <FiFilter size={16} className="text-dark-400 hidden sm:block" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-[42px] rounded-[11px] border border-dark-200 bg-dark-50 px-3.5 pr-8 text-sm text-ink transition-all duration-200 focus:border-primary-500 focus:bg-white focus:outline-none appearance-none cursor-pointer min-w-[150px]"
            >
              <option value="">All Levels</option>
              {COURSE_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={FiBookOpen}
          title="No courses found"
          description={search || levelFilter ? 'Try adjusting your search or filters.' : 'No courses are available yet. Check back soon!'}
          action={search || levelFilter ? 'Clear Filters' : undefined}
          onAction={search || levelFilter ? () => { setSearch(''); setLevelFilter(''); } : undefined}
        />
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {courses.map((course, idx) => {
              const courseId = course._id || course.id;
              const slug = course.slug || courseId;
              const enrolled = enrolledMap[courseId];
              const isEnrolled = !!enrolled;
              const purchase = purchasedMap[courseId];
              const hasPendingPurchase = purchase?.status === 'pending';
              const isApproved = purchase?.status === 'active' || isEnrolled;
              const totalLessons = course.totalLessons ?? course.lessons?.length ?? 0;
              const studentsCount = course.totalStudents ?? course.enrolledStudents ?? 0;
              const progress = enrolled?.progress ?? enrolled?.enrollment?.progress ?? 0;
              const completedLessons = enrolled?.completedLessons ?? enrolled?.enrollment?.completedLessons ?? 0;
              const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress;
              const price = course.price ?? 0;
              const isPaid = price > 0;

              return (
                <motion.div key={courseId || idx} variants={item}>
                  <Link to={`/student/courses/${slug}`}>
                    <Card hover className="p-0 overflow-hidden h-full flex flex-col">
                      <div className={`relative h-40 bg-gradient-to-br ${gradientPlaceholders[idx % gradientPlaceholders.length]} flex items-center justify-center`}>
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <FiBookOpen size={36} className="text-white/30" />
                        )}
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                          {course.level && (
                            <Badge color={levelColor[course.level] || 'neutral'}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </Badge>
                          )}
                          {isPaid && (
                            <Badge color="warning">${price}</Badge>
                          )}
                        </div>
                        {(isApproved || isEnrolled) && (
                          <div className="absolute top-2.5 right-2.5">
                            <Badge color="success">Active</Badge>
                          </div>
                        )}
                        {hasPendingPurchase && (
                          <div className="absolute top-2.5 right-2.5">
                            <Badge color="info">Pending</Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-ink text-sm leading-tight mb-1.5">
                          {course.title}
                        </h3>

                        {course.description && (
                          <p className="text-xs text-dark-500 line-clamp-2 mb-2.5 flex-1">
                            {course.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-dark-500 mb-2.5">
                          <span className="flex items-center gap-1">
                            <FiBookOpen size={12} />
                            {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUsers size={12} />
                            {studentsCount} student{studentsCount !== 1 ? 's' : ''}
                          </span>
                          {isPaid && (
                            <span className="flex items-center gap-1">
                              <FiDollarSign size={12} />
                              {formatCurrency(price)}
                            </span>
                          )}
                        </div>

                        {isApproved && totalLessons > 0 && (
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-xs text-dark-500 mb-1">
                              <span>{completedLessons}/{totalLessons} lessons</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-dark-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {isApproved ? (
                          <Button variant="secondary" className="w-full gap-1.5" size="sm">
                            Continue Learning <FiChevronRight size={14} />
                          </Button>
                        ) : hasPendingPurchase ? (
                          <Button variant="outline" className="w-full" size="sm" disabled>
                            <FiClock size={14} /> Pending Approval
                          </Button>
                        ) : isPaid ? (
                          <Button
                            variant="primary"
                            className="w-full gap-1.5"
                            size="sm"
                            onClick={(e) => openBuyModal(e, course)}
                            loading={walletPaying}
                          >
                            <FiCreditCard size={14} />
                            Buy ${price}
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full"
                            size="sm"
                            loading={enrolling === courseId}
                            onClick={(e) => handleEnroll(e, courseId)}
                          >
                            Enroll Free
                          </Button>
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-500">
                {totalItems} course{totalItems !== 1 ? 's' : ''} total
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={buyModal}
        onClose={() => setBuyModal(false)}
        title="Confirm Purchase"
        size="sm"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Course</span>
              <span className="font-medium text-ink">{selectedCourse?.title}</span>
            </div>
            <div className="border-t border-dark-200 pt-2 flex justify-between text-sm">
              <span className="text-dark-500">Amount</span>
              <span className="font-bold text-ink">${selectedCourse?.price}</span>
            </div>
          </div>

          {wallet ? (
            <div className="p-4 rounded-xl border border-primary-200 bg-primary-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Wallet Balance</p>
                  <p className="text-lg font-bold text-ink">{formatCurrency(wallet.availableBalance ?? wallet.available ?? 0)}</p>
                </div>
                <FiShield size={24} className="text-primary-500" />
              </div>
              {(wallet.availableBalance ?? wallet.available ?? 0) >= (selectedCourse?.price || 0) ? (
                <Button
                  variant="primary"
                  className="w-full gap-1.5"
                  onClick={handleWalletPurchase}
                  loading={walletPaying}
                >
                  <FiCheck size={16} />
                  Buy Now — ${selectedCourse?.price}
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-xs text-red-600">Insufficient balance.</p>
                  <Link
                    to="/student/wallet"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    onClick={() => setBuyModal(false)}
                  >
                    <FiPlus size={14} />
                    Deposit to Wallet
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dark-200 text-center space-y-3">
              <p className="text-sm text-dark-500">No wallet found.</p>
              <Link
                to="/student/wallet"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                onClick={() => setBuyModal(false)}
              >
                <FiPlus size={14} />
                Create Wallet
              </Link>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
