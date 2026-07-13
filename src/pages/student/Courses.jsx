import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiBookOpen,
  FiUsers,
  FiFilter,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import courseService from '../../services/courseService';
import { COURSE_LEVELS } from '../../constants/index';

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
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, perPage: 9 };
      if (search) params.search = search;
      if (levelFilter) params.level = levelFilter;

      const data = await courseService.getCourses(params);
      const list = data.courses || data.data || data;
      setCourses(Array.isArray(list) ? list : []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 9) || 1);
      setTotalItems(data.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, search, levelFilter]);

  const fetchEnrolled = useCallback(async () => {
    try {
      const data = await courseService.getEnrolled();
      const list = data.data?.courses || data.data?.data || data.courses || data.data || [];
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((c) => {
          map[c._id || c.id] = c;
        });
      }
      setEnrolledMap(map);
    } catch {
      // silent — enrolled info is supplementary
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchEnrolled();
  }, [fetchEnrolled]);

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-ink">Course Catalog</h1>
        <p className="mt-0.5 text-sm text-dark-500">
          Browse and enroll in trading courses to advance your skills.
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
              const totalLessons = course.totalLessons ?? course.lessons?.length ?? 0;
              const studentsCount = course.totalStudents ?? course.enrolledStudents ?? 0;
              const progress = enrolled?.progress ?? enrolled?.enrollment?.progress ?? 0;
              const completedLessons = enrolled?.completedLessons ?? enrolled?.enrollment?.completedLessons ?? 0;
              const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress;

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
                        {course.level && (
                          <div className="absolute top-2.5 left-2.5">
                            <Badge color={levelColor[course.level] || 'neutral'}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </Badge>
                          </div>
                        )}
                        {isEnrolled && (
                          <div className="absolute top-2.5 right-2.5">
                            <Badge color="success">Enrolled</Badge>
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
                        </div>

                        {isEnrolled && totalLessons > 0 && (
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

                        {isEnrolled ? (
                          <Button variant="secondary" className="w-full gap-1.5" size="sm">
                            Continue Learning <FiChevronRight size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-full"
                            size="sm"
                            loading={enrolling === courseId}
                            onClick={(e) => handleEnroll(e, courseId)}
                          >
                            Enroll Now
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
    </div>
  );
}
