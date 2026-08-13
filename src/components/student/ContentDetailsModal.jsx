import { Link } from 'react-router-dom';
import {
  FiVideo,
  FiRadio,
  FiTrendingUp,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiUser,
  FiPaperclip,
  FiDownload,
  FiPlay,
  FiExternalLink,
  FiFileText,
} from 'react-icons/fi';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDateTime } from '../../utils/helpers';

const typeConfig = {
  webinar: { label: 'Free Webinar', icon: FiVideo, color: 'info' },
  zoomSession: { label: 'Zoom Session', icon: FiRadio, color: 'success' },
  marketUpdate: { label: 'Market Update', icon: FiTrendingUp, color: 'info' },
  announcement: { label: 'Announcement', icon: FiFileText, color: 'info' },
  course: { label: 'Free Training', icon: FiBookOpen, color: 'primary' },
};

export default function ContentDetailsModal({ item, isOpen, onClose, isFreeUser }) {
  if (!item) return null;

  const contentType = item.contentType || 'announcement';
  const config = typeConfig[contentType] || typeConfig.announcement;
  const Icon = config.icon;
  const title = item.title || item.subject || 'Content';
  const content = item.description || item.content || item.summary || item.message || '';
  const image = item.thumbnail || item.image;
  const date = item.date || item.publishedAt || item.createdAt;
  const isLocked = isFreeUser && (contentType === 'webinar' && item.type === 'premium-webinar');

  const joinLink = contentType === 'webinar'
    ? item.webinarUrl
    : contentType === 'zoomSession'
      ? item.zoomLink
      : contentType === 'marketUpdate'
        ? item.contentUrl
        : null;

  const recordedLink = contentType === 'webinar' ? item.recordedUrl : null;

  const handleLink = (e, url) => {
    if (!url || url === '#') {
      e.preventDefault();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      {image && (
        <div className="relative h-44 rounded-xl overflow-hidden bg-dark-100 mb-5">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <Badge color={config.color}>
              <Icon size={12} className="mr-1 inline" /> {config.label}
            </Badge>
          </div>
        </div>
      )}

      {!image && (
        <div className="flex items-center gap-2 mb-3">
          <Badge color={config.color}>
            <Icon size={12} className="mr-1 inline" /> {config.label}
          </Badge>
        </div>
      )}

      <h3 className="text-lg font-extrabold text-ink leading-snug mb-2">{title}</h3>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-dark-500 mb-4">
        {date && (
          <span className="flex items-center gap-1.5">
            <FiCalendar size={13} /> {formatDateTime(date)}
          </span>
        )}
        {(contentType === 'webinar' || contentType === 'zoomSession') && item.duration && (
          <span className="flex items-center gap-1.5">
            <FiClock size={13} /> {item.duration} min
          </span>
        )}
        {item.instructorName && (
          <span className="flex items-center gap-1.5">
            <FiUser size={13} /> {item.instructorName}
          </span>
        )}
        {contentType === 'course' && item.price !== undefined && item.price > 0 && (
          <span className="font-semibold text-primary-600">${Number(item.price).toFixed(2)}</span>
        )}
      </div>

      {content && (
        <div className="prose prose-sm max-w-none text-dark-600 text-sm leading-relaxed">
          {content.split('\n').map((paragraph, pIdx) => (
            <p key={pIdx} className="mb-2 last:mb-0">{paragraph}</p>
          ))}
        </div>
      )}

      {contentType === 'announcement' && item.video && (
        <div className="mt-4 rounded-xl overflow-hidden bg-dark-900">
          <video src={item.video} controls playsInline preload="metadata" className="w-full max-h-72">
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {contentType === 'marketUpdate' && item.type === 'video' && joinLink && (
        <div className="mt-4 rounded-xl overflow-hidden bg-dark-900">
          <video src={joinLink} controls playsInline preload="metadata" className="w-full max-h-72">
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {Array.isArray(item.attachments) && item.attachments.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Attachments</p>
          {item.attachments.map((att, attIdx) => {
            const attUrl = att.fileUrl || att.url || att;
            const attName = att.fileName || att.name || (typeof att === 'string' ? att.split('/').pop() : 'Download');
            const attSize = att.fileSize ? ` (${(att.fileSize / (1024 * 1024)).toFixed(1)} MB)` : '';
            return (
              <a
                key={attIdx}
                href={attUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-3 rounded-xl border border-dark-200 bg-white px-4 py-3 hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <FiPaperclip size={16} />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{attName}{attSize}</span>
                <FiDownload size={16} className="shrink-0 text-primary-500" />
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-dark-100">
        {isLocked ? (
          <Link to="/student/subscription" className="w-full">
            <Button variant="primary" className="w-full">Upgrade to Unlock</Button>
          </Link>
        ) : contentType === 'course' ? (
          <Link to={`/student/courses/${item.slug || item._id}`} className="w-full">
            <Button variant="primary" className="w-full">Enroll Now</Button>
          </Link>
        ) : (
          <>
            {joinLink && (
              <a
                href={joinLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleLink(e, joinLink)}
                className="w-full sm:w-auto"
              >
                <Button variant="primary" className="w-full">
                  <FiExternalLink size={14} className="mr-1.5" />
                  {contentType === 'webinar' ? 'Join / Register Webinar' : contentType === 'zoomSession' ? 'Join Session' : 'Open Content'}
                </Button>
              </a>
            )}
            {recordedLink && (
              <a href={recordedLink} target="_blank" rel="noopener noreferrer" onClick={(e) => handleLink(e, recordedLink)}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <FiPlay size={14} className="mr-1.5" /> Watch Recording
                </Button>
              </a>
            )}
          </>
        )}
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
      </div>
    </Modal>
  );
}
