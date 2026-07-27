import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiMonitor, FiCalendar, FiClock, FiUser, FiLink, FiExternalLink, FiAlertCircle } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import classService from '../../services/classService';
import { formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchClasses() {
      try {
        setLoading(true);
        const res = await classService.getClasses({ perPage: 50 });
        const body = res.data;
        const list = body.data || [];
        if (!cancelled) setClasses(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setClasses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchClasses();
    return () => { cancelled = true; };
  }, []);

  const upcoming = classes.filter(c => !c.date || new Date(c.date) >= new Date());
  const past = classes.filter(c => c.date && new Date(c.date) < new Date());

  const renderClassCard = (cls, idx) => {
    const isPast = cls.date && new Date(cls.date) < new Date();
    return (
      <motion.div key={cls._id || idx} variants={item}>
        <Card className={`p-[22px] ${isPast ? 'opacity-70' : ''}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cls.type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
              {cls.type === 'online' ? <FiMonitor size={22} /> : <FiVideo size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-ink">{cls.title}</h3>
                <Badge color={cls.type === 'online' ? 'info' : 'warning'}>{cls.type === 'online' ? 'Online' : 'Physical'}</Badge>
                {isPast && <Badge color="default">Completed</Badge>}
              </div>
              {cls.description && (
                <p className="mt-1 text-sm text-dark-500 line-clamp-2">{cls.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-dark-500">
                <span className="flex items-center gap-1"><FiCalendar size={13} /> {cls.date ? formatDate(cls.date) : '---'}</span>
                {cls.time && <span className="flex items-center gap-1"><FiClock size={13} /> {cls.time}</span>}
                {cls.instructor && <span className="flex items-center gap-1"><FiUser size={13} /> {cls.instructor}</span>}
              </div>
              {cls.type === 'online' && cls.meetLink && !isPast && (
                <a href={cls.meetLink} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                  <FiExternalLink size={15} /> Join Google Meet
                </a>
              )}
              {cls.type === 'physical' && cls.videoUrl && (
                <a href={cls.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
                  <FiVideo size={15} /> Watch Recording
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Classes</h1>
          <p className="mt-1 text-sm text-dark-500">Your upcoming and past classes</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-[22px]"><Skeleton count={3} className="h-6 w-full" /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Classes</h1>
          <p className="mt-1 text-sm text-dark-500">Your upcoming and past classes</p>
        </div>
        <Card className="p-12 text-center text-dark-400">
          <FiAlertCircle size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No classes available yet. Check back later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Classes</h1>
        <p className="mt-1 text-sm text-dark-500">Your upcoming and past classes</p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
            <FiCalendar className="text-primary-500" size={18} />
            Upcoming Classes
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
            {upcoming.map((cls, idx) => renderClassCard(cls, idx))}
          </motion.div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
            <FiVideo className="text-dark-400" size={18} />
            Past Classes
          </h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
            {past.map((cls, idx) => renderClassCard(cls, idx))}
          </motion.div>
        </div>
      )}
    </div>
  );
}