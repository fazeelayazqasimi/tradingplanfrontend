import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiVideo, FiMonitor, FiCalendar, FiClock, FiUser, FiLink, FiExternalLink, FiAlertCircle, FiBook, FiPlay, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import classService from '../../services/classService';
import marketUpdateService from '../../services/marketUpdateService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const TABS = [
  { key: 'classes/physical', label: 'Physical Classes', icon: FiVideo },
  { key: 'classes/online', label: 'Online Classes', icon: FiMonitor },
  { key: 'classes/schedule', label: 'Class Schedule', icon: FiClock },
  { key: 'study-material', label: 'Study Material', icon: FiBook },
  { key: 'recordings', label: 'Recordings', icon: FiPlay },
];

export default function Classes() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathTab = TABS.find(t => location.pathname.includes(t.key))?.key || 'classes/physical';
  const [activeTab, setActiveTab] = useState(pathTab);
  const [classes, setClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [enrollClass, setEnrollClass] = useState(null);
  const [preferredSlot, setPreferredSlot] = useState('Morning');
  const [preferredDays, setPreferredDays] = useState([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const tab = TABS.find(t => location.pathname.includes(t.key))?.key || 'classes/physical';
    setActiveTab(tab);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [classRes, materialRes] = await Promise.allSettled([
          classService.getClasses({ perPage: 50 }),
          marketUpdateService.getMarketUpdates({ perPage: 50 }),
        ]);
        if (!cancelled) {
          if (classRes.status === 'fulfilled') {
            const body = classRes.value.data;
            setClasses(Array.isArray(body.data) ? body.data : []);
          }
          if (materialRes.status === 'fulfilled') {
            const body = materialRes.value.data;
            const data = body.data?.data || body.data?.updates || body.data || [];
            setStudyMaterials(Array.isArray(data) ? data : []);
          }
        }
      } catch {} finally { if (!cancelled) setLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const physicalClasses = classes.filter(c => c.type === 'physical');
  const onlineClasses = classes.filter(c => c.type === 'online');
  const recordings = classes.filter(c => c.videoUrl && c.type === 'physical');
  const allClassesSorted = [...classes].sort((a, b) => {
    const aDate = a.date ? new Date(a.date) : new Date(0);
    const bDate = b.date ? new Date(b.date) : new Date(0);
    return aDate - bDate;
  });

  const handleTabChange = (key) => {
    navigate(`/student/${key}`, { replace: true });
  };

  const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const SLOT_OPTIONS = ['Morning', 'Evening', 'Weekend'];

  const isEnrolled = (cls) =>
    !!user && Array.isArray(cls.enrollments) &&
    cls.enrollments.some(e => e.userId === user._id || e.userId === user.id);

  const openEnroll = (cls) => {
    const existing = (isEnrolled(cls) && cls.enrollments.find(e => e.userId === user._id || e.userId === user.id)) || null;
    setPreferredSlot(existing?.preferredSlot || 'Morning');
    setPreferredDays(existing?.preferredDays || []);
    setEnrollClass(cls);
  };

  const toggleDay = (day) => {
    setPreferredDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollClass) return;
    setEnrolling(true);
    try {
      await classService.enroll(enrollClass._id, { preferredSlot, preferredDays });
      toast.success('Enrollment submitted to Dream Traders Academy');
      setEnrollClass(null);
      const res = await classService.getClasses({ perPage: 50 });
      const body = res.data;
      setClasses(Array.isArray(body.data) ? body.data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

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
                <p className="mt-1 text-sm text-dark-500">{cls.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-dark-500">
                <span className="flex items-center gap-1"><FiCalendar size={13} /> {cls.date ? formatDate(cls.date) : '---'}</span>
                {cls.time && <span className="flex items-center gap-1"><FiClock size={13} /> {cls.time}</span>}
                {cls.instructor && <span className="flex items-center gap-1"><FiUser size={13} /> {cls.instructor}</span>}
              </div>
              {cls.type === 'online' && cls.meetLink && !isPast && (
                <a href={cls.meetLink} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
                  <FiExternalLink size={15} /> Join Class
                </a>
              )}
              {cls.videoUrl && (
                <a href={cls.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
                  <FiVideo size={15} /> Watch Recording
                </a>
              )}
              <button onClick={() => openEnroll(cls)} disabled={isEnrolled(cls)}
                className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${isEnrolled(cls) ? 'bg-emerald-500 cursor-default' : 'bg-primary-500 hover:bg-primary-600'}`}>
                {isEnrolled(cls) ? <><FiCheckCircle size={15} /> Enrolled</> : 'Fill Class Form'}
              </button>
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
          <p className="mt-1 text-sm text-dark-500">Your training materials and sessions</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-[22px]"><Skeleton count={3} className="h-6 w-full" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const tabContent = () => {
    switch (activeTab) {
      case 'classes/physical':
        return physicalClasses.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
            {physicalClasses.map((cls, idx) => renderClassCard(cls, idx))}
          </motion.div>
        ) : (
          <Card className="p-12 text-center text-dark-400">
            <FiVideo size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No physical classes available yet.</p>
          </Card>
        );
      case 'classes/online':
        return onlineClasses.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
            {onlineClasses.map((cls, idx) => renderClassCard(cls, idx))}
          </motion.div>
        ) : (
          <Card className="p-12 text-center text-dark-400">
            <FiMonitor size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No online classes available yet.</p>
          </Card>
        );
      case 'classes/schedule':
        return allClassesSorted.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
              <FiCalendar className="text-primary-500" size={18} />
              Upcoming Classes
            </h2>
            {allClassesSorted.filter(c => !c.date || new Date(c.date) >= new Date()).length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 mb-6">
                {allClassesSorted.filter(c => !c.date || new Date(c.date) >= new Date()).map((cls, idx) => renderClassCard(cls, idx))}
              </motion.div>
            ) : (
              <Card className="p-8 text-center text-dark-400 mb-6">
                <FiCalendar size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming classes</p>
              </Card>
            )}
            <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
              <FiClock className="text-dark-400" size={18} />
              Past Classes
            </h2>
            {allClassesSorted.filter(c => c.date && new Date(c.date) < new Date()).length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
                {allClassesSorted.filter(c => c.date && new Date(c.date) < new Date()).map((cls, idx) => renderClassCard(cls, idx))}
              </motion.div>
            ) : (
              <p className="text-sm text-dark-400 text-center py-4">No past classes</p>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center text-dark-400">
            <FiCalendar size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No class schedule available yet.</p>
          </Card>
        );
      case 'study-material':
        return studyMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyMaterials.map((mat) => (
              <Card key={mat._id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                    <FiBook size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink truncate">{mat.title}</p>
                    <p className="text-xs text-dark-400">{mat.category || 'Study Material'}</p>
                  </div>
                </div>
                <p className="text-xs text-dark-500 line-clamp-2 mb-3">{mat.summary || mat.description || ''}</p>
                {mat.contentUrl && (
                  <a href={mat.contentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">View Material</Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-dark-400">
            <FiBook size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No study materials available yet.</p>
          </Card>
        );
      case 'recordings':
        return recordings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((rec) => (
              <Card key={rec._id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                    <FiPlay size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink truncate">{rec.title}</p>
                    <p className="text-xs text-dark-400">{rec.date ? formatDate(rec.date) : ''}</p>
                  </div>
                </div>
                {rec.description && <p className="text-xs text-dark-500 line-clamp-2 mb-3">{rec.description}</p>}
                {rec.videoUrl && (
                  <a href={rec.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <FiPlay size={14} className="mr-1" /> Watch Recording
                    </Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-dark-400">
            <FiPlay size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No recordings available yet.</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Classes & Training</h1>
        <p className="mt-1 text-sm text-dark-500">Browse classes, study materials, and recordings</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 bg-dark-50 p-1.5 rounded-xl">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive ? 'bg-white text-primary-600 shadow-sm border border-dark-100' : 'text-dark-500 hover:text-dark-700 hover:bg-white/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabContent()}

      <Modal isOpen={!!enrollClass} onClose={() => setEnrollClass(null)} title="Class Enrollment" size="lg">
        {enrollClass && (
          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 text-black px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-black/70">Dream Traders Academy</p>
              <p className="text-base font-bold">{enrollClass.title}</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Preferred Slot</label>
              <Select value={preferredSlot} onChange={(e) => setPreferredSlot(e.target.value)}>
                {SLOT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Preferred Days</label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {DAY_OPTIONS.map(day => (
                  <button type="button" key={day} onClick={() => toggleDay(day)}
                    className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${preferredDays.includes(day) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-500 hover:border-dark-300'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setEnrollClass(null)}>Cancel</Button>
              <Button type="submit" loading={enrolling}>Submit Enrollment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
