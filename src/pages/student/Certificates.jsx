import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiDownload,
  FiExternalLink,
  FiCalendar,
  FiHash,
  FiBookOpen,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/studentService';
import { formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const gradeColors = {
  A: 'success',
  'A+': 'success',
  'A-': 'success',
  B: 'info',
  'B+': 'info',
  'B-': 'info',
  C: 'warning',
  D: 'danger',
  F: 'danger',
};

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
];

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCertificates() {
      try {
        setLoading(true);
        const res = await studentService.getMyCertificates();
        const data = res?.data?.data || res?.data || res;
        const list = data?.certificates || data?.data || data;
        if (!cancelled) setCertificates(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) toast.error('Failed to load certificates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCertificates();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = (cert) => {
    if (cert.downloadUrl || cert.fileUrl || cert.url) {
      window.open(cert.downloadUrl || cert.fileUrl || cert.url, '_blank');
    } else {
      toast('Download will be available soon', { icon: 'info' });
    }
  };

  const handleView = (cert) => {
    if (cert.viewUrl || cert.downloadUrl || cert.fileUrl) {
      window.open(cert.viewUrl || cert.downloadUrl || cert.fileUrl, '_blank');
    } else {
      toast('Preview will be available soon', { icon: 'info' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Certificates</h1>
          <p className="mt-1 text-sm text-dark-500">
            Certificates earned from completed courses
          </p>
        </div>
        {!loading && certificates.length > 0 && (
          <Badge color="info">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={FiAward}
          title="No certificates yet"
          description="Complete a course to earn your first certificate. Keep learning and building your skills!"
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {certificates.map((cert, idx) => {
            const id = cert._id || cert.id;
            const courseName = cert.courseName || cert.course?.title || cert.courseTitle || 'Untitled Course';
            const certNumber = cert.certificateNumber || cert.number || cert.serialNumber || `CERT-${String(id).slice(-6).toUpperCase()}`;
            const completionDate = cert.completedAt || cert.completionDate || cert.issuedAt || cert.createdAt;
            const grade = cert.grade || cert.score || null;

            return (
              <motion.div key={id || idx} variants={item}>
                <Card className="p-0 overflow-hidden h-full flex flex-col">
                  <div className={`relative h-32 bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <FiAward size={36} className="mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-medium uppercase tracking-wider opacity-70">Certificate of Completion</p>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-ink text-base leading-tight mb-3 line-clamp-2">
                      {courseName}
                    </h3>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-dark-500">
                        <FiHash size={14} className="shrink-0 text-dark-400" />
                        <span className="truncate">{certNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-dark-500">
                        <FiCalendar size={14} className="shrink-0 text-dark-400" />
                        <span>{formatDate(completionDate)}</span>
                      </div>
                      {grade && (
                        <div className="flex items-center gap-2 text-sm text-dark-500">
                          <FiBookOpen size={14} className="shrink-0 text-dark-400" />
                          <span>Grade: </span>
                          <Badge color={gradeColors[grade] || 'neutral'}>{grade}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handleView(cert)}
                      >
                        <FiExternalLink size={14} />
                        View
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => handleDownload(cert)}
                      >
                        <FiDownload size={14} />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
