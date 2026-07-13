import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiPlay,
  FiFileText,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import courseService from '../../services/courseService';

const levelColor = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'danger',
};

const lessonTypeIcon = {
  video: FiPlay,
  text: FiFileText,
  quiz: FiAward,
  assignment: FiFileText,
};

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourse(slug);
      const c = data.data?.course || data.data?.data || data.data || data;
      setCourse(c);
      return c;
    } catch (err) {
      toast.error(err.message || 'Failed to load course');
      return null;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchProgress = useCallback(async (courseId) => {
    try {
      const data = await courseService.getProgress(courseId);
      const p = data.data?.progress || data.data || data;
      setProgressData(p);
      setIsEnrolled(true);

      const completed = p?.completedLessons || p?.completed || [];
      const lessons = course?.lessons || [];
      if (lessons.length > 0) {
        const firstIncomplete = lessons.findIndex(
          (l) => !completed.includes(l._id || l.id)
        );
        setActiveLessonIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
    } catch {
      setIsEnrolled(false);
      setProgressData(null);
    }
  }, [course]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const c = await fetchCourse();
      if (cancelled || !c) return;
      const courseId = c._id || c.id;
      await fetchProgress(courseId);
    }
    load();
    return () => { cancelled = true; };
  }, [fetchCourse, fetchProgress]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const courseId = course._id || course.id;
      await courseService.enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      await fetchProgress(courseId);
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkComplete = async (lessonId) => {
    try {
      setCompleting(lessonId);
      const courseId = course._id || course.id;
      await courseService.updateProgress(courseId, lessonId);
      toast.success('Lesson marked as complete!');

      const data = await courseService.getProgress(courseId);
      const p = data.data?.progress || data.data || data;
      setProgressData(p);

      const lessons = course?.lessons || [];
      const completed = p?.completedLessons || p?.completed || [];
      const nextIdx = lessons.findIndex(
        (l, i) => i > activeLessonIdx && !completed.includes(l._id || l.id)
      );
      if (nextIdx >= 0) setActiveLessonIdx(nextIdx);
    } catch (err) {
      toast.error(err.message || 'Failed to update progress');
    } finally {
      setCompleting(null);
    }
  };

  const completedLessons = progressData?.completedLessons || progressData?.completed || [];
  const lessons = course?.lessons || [];
  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const currentLesson = lessons[activeLessonIdx] || null;
  const currentLessonId = currentLesson?._id || currentLesson?.id;
  const isCurrentComplete = completedLessons.includes(currentLessonId);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FiBookOpen size={40} className="text-dark-300 mb-3" />
        <h2 className="text-lg font-semibold text-dark-700 mb-2">Course not found</h2>
        <Link to="/student/courses">
          <Button variant="outline" className="mt-3 gap-1.5">
            <FiArrowLeft size={16} /> Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-primary-500 transition-colors"
      >
        <FiArrowLeft size={16} />
        Back to Courses
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 overflow-hidden">
          <div className="relative h-44 sm:h-56 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <FiBookOpen size={56} className="text-white/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                {course.level && (
                  <Badge color={levelColor[course.level] || 'neutral'}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                )}
                {course.category && (
                  <Badge color="neutral">{course.category}</Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">{course.title}</h1>
            </div>
          </div>

          <div className="p-[22px]">
            <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500 mb-3">
              {course.instructor && (
                <span className="flex items-center gap-1.5">
                  <FiUsers size={14} />
                  {course.instructor?.firstName ? `${course.instructor.firstName} ${course.instructor.lastName}` : (course.instructor || '')}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <FiBookOpen size={14} />
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </span>
              {course.totalStudents != null && (
                <span className="flex items-center gap-1.5">
                  <FiUsers size={14} />
                  {course.totalStudents} students
                </span>
              )}
            </div>
            {course.description && (
              <p className="text-sm text-dark-600 leading-relaxed">{course.description}</p>
            )}

            {isEnrolled && totalLessons > 0 && (
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs text-dark-500 mb-1">
                  <span>Progress</span>
                  <span className="font-medium text-dark-700">
                    {completedCount}/{totalLessons} ({progressPct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-dark-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-primary-500"
                  />
                </div>
              </div>
            )}

            {!isEnrolled && (
              <div className="mt-4">
                <Button onClick={handleEnroll} loading={enrolling} size="md" className="gap-1.5">
                  <FiBookOpen size={16} />
                  Enroll in This Course
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {isEnrolled ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-0 overflow-hidden">
              {currentLesson ? (
                <div>
                  {currentLesson.type === 'video' && (currentLesson.videoUrl || currentLesson.content) ? (
                    <div className="aspect-video bg-dark-900 flex items-center justify-center">
                      {currentLesson.videoUrl ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-dark-400">
                            <FiPlay size={40} className="mx-auto mb-2" />
                            <p className="text-sm">Video player placeholder</p>
                            <p className="text-xs text-dark-500 mt-1">Video: {currentLesson.videoUrl}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-dark-400">
                            <FiPlay size={40} className="mx-auto mb-2" />
                            <p className="text-sm">Video content placeholder</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="p-[22px]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Badge color={levelColor[currentLesson.level] || 'neutral'}>
                        Lesson {activeLessonIdx + 1}
                      </Badge>
                      {currentLesson.type && (
                        <Badge color="neutral">
                          {currentLesson.type.charAt(0).toUpperCase() + currentLesson.type.slice(1)}
                        </Badge>
                      )}
                      {isCurrentComplete && (
                        <Badge color="success">Completed</Badge>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-ink mb-3">
                      {currentLesson.title}
                    </h2>

                    {currentLesson.content && (
                      <div className="prose prose-sm max-w-none text-dark-600 leading-relaxed whitespace-pre-wrap">
                        {currentLesson.content}
                      </div>
                    )}

                    {!currentLesson.content && !currentLesson.videoUrl && (
                      <div className="py-10 text-center text-dark-400">
                        <FiFileText size={36} className="mx-auto mb-2" />
                        <p className="text-sm">No content available for this lesson yet.</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-dark-100">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activeLessonIdx <= 0}
                        onClick={() => setActiveLessonIdx((prev) => Math.max(0, prev - 1))}
                      >
                        Previous
                      </Button>

                      {!isCurrentComplete ? (
                        <Button
                          size="sm"
                          loading={completing === currentLessonId}
                          onClick={() => handleMarkComplete(currentLessonId)}
                          className="gap-1.5"
                        >
                          <FiCheckCircle size={14} />
                          Mark as Complete
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled className="gap-1.5">
                          <FiCheckCircle size={14} />
                          Completed
                        </Button>
                      )}

                      <div className="flex-1" />

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activeLessonIdx >= totalLessons - 1}
                        onClick={() => setActiveLessonIdx((prev) => Math.min(totalLessons - 1, prev + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center text-dark-400">
                  <FiBookOpen size={40} className="mx-auto mb-2" />
                  <p className="text-sm">No lessons available in this course yet.</p>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-ink text-sm mb-3">
                Lessons ({totalLessons})
              </h3>
              <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
                {lessons.map((lesson, idx) => {
                  const lid = lesson._id || lesson.id;
                  const complete = completedLessons.includes(lid);
                  const active = idx === activeLessonIdx;
                  const TypeIcon = lessonTypeIcon[lesson.type] || FiFileText;

                  return (
                    <button
                      key={lid || idx}
                      onClick={() => setActiveLessonIdx(idx)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-[11px] text-left transition-all duration-200 ${
                        active
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-dark-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        complete
                          ? 'bg-emerald-100 text-emerald-600'
                          : active
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-dark-100 text-dark-400'
                      }`}>
                        {complete ? (
                          <FiCheckCircle size={14} />
                        ) : (
                          <TypeIcon size={13} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium truncate ${
                          active ? 'text-primary-700' : 'text-dark-700'
                        }`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.type && (
                            <span className="text-xs text-dark-400 capitalize">{lesson.type}</span>
                          )}
                          {lesson.duration && (
                            <span className="flex items-center gap-0.5 text-xs text-dark-400">
                              <FiClock size={9} />
                              {lesson.duration}min
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
