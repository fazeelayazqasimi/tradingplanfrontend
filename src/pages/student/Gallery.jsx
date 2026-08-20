import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiVideo, FiX, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX, FiPlay, FiPause, FiFileText, FiDownload } from 'react-icons/fi';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StudentGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/media/published');
        const body = res?.data || {};
        setItems(body?.data || []);
      } catch { setItems([]); }
      setLoading(false);
    })();
  }, []);

  const images = items.flatMap(item =>
    (item.images || []).map(img => ({
      type: 'image',
      url: img.startsWith('http') ? img : `${API_URL}/${img}`,
      title: item.title,
    }))
  );

  const videos = items.flatMap(item =>
    (item.videos || []).map(vid => ({
      type: 'video',
      url: vid.startsWith('http') ? vid : `${API_URL}/${vid}`,
      title: item.title,
    }))
  );

  const documents = items.flatMap(item =>
    (item.documents || []).map(doc => ({
      url: doc.startsWith('http') ? doc : `${API_URL}/${doc}`,
      title: item.title,
      name: doc.split('/').pop(),
    }))
  );

  const allMedia = [...images, ...videos];

  const goNext = useCallback(() => {
    setSelectedIdx(prev => prev === null ? null : (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const goPrev = useCallback(() => {
    setSelectedIdx(prev => prev === null ? null : (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  const toggleMute = useCallback(() => {
    setVideoMuted(prev => !prev);
  }, []);

  const togglePlay = useCallback(() => {
    setVideoPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = videoMuted;
      if (videoPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [videoMuted, videoPlaying]);

  useEffect(() => {
    setVideoMuted(true);
    setVideoPlaying(true);
  }, [selectedIdx]);

  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') setSelectedIdx(null);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [selectedIdx, goNext, goPrev]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="text-lg font-bold text-ink">Gallery</h1>
        <p className="text-sm text-dark-500 mt-0.5">Photos and videos from our trading community</p>
      </motion.div>

      <motion.div variants={item}>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : allMedia.length === 0 ? (
          <EmptyState icon={FiImage} title="No media yet" message="Gallery content will appear here once uploaded." />
        ) : (
          <>
            {videos.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <FiVideo size={20} className="text-primary-500" /> Videos
                  </h2>
                </div>
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${(selectedIdx !== null && allMedia[selectedIdx]?.type === 'video') ? videos.indexOf(allMedia[selectedIdx]) * 100 : 0}%)` }}
                    >
                      {videos.map((video, idx) => (
                        <div key={`vid-${idx}`} className="w-full flex-shrink-0">
                          <div className="relative aspect-video bg-dark-900 rounded-2xl overflow-hidden group">
                            <video
                              ref={selectedIdx !== null && allMedia[selectedIdx]?.type === 'video' && videos.indexOf(allMedia[selectedIdx]) === idx ? videoRef : null}
                              src={video.url}
                              className="w-full h-full object-contain"
                              muted={videoMuted}
                              autoPlay
                              playsInline
                              onPlay={() => setVideoPlaying(true)}
                              onPause={() => setVideoPlaying(false)}
                              onEnded={() => setVideoPlaying(false)}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                  className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                                >
                                  {videoPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                  className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                                >
                                  {videoMuted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
                                </button>
                              </div>
                              <p className="text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {video.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {videos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <FiChevronRight size={20} />
                      </button>
                      <div className="flex justify-center gap-1.5 mt-3">
                        {videos.map((_, idx) => (
                          <button
                            key={`dot-${idx}`}
                            onClick={() => {
                              const globalIdx = images.length + idx;
                              setSelectedIdx(globalIdx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedIdx === images.length + idx ? 'bg-primary-500 w-4' : 'bg-dark-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {images.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <FiImage size={20} className="text-primary-500" /> Photos
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={`img-${idx}`}
                      onClick={() => setSelectedIdx(idx)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-medium truncate">{img.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {documents.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                    <FiFileText size={20} className="text-red-500" /> Documents
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.map((doc, idx) => (
                    <a
                      key={`doc-${idx}`}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-3 rounded-xl border border-dark-100 bg-white p-3.5 shadow-card hover:border-red-300 hover:shadow-card-md transition-all"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                        <FiFileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{doc.name}</p>
                        <p className="text-xs text-dark-400 truncate">{doc.title}</p>
                      </div>
                      <FiDownload size={15} className="shrink-0 text-red-500" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </motion.div>

      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedIdx(null)}
        >
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <FiX size={24} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <FiChevronLeft size={28} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <FiChevronRight size={28} />
          </button>

          <div className="flex flex-col items-center gap-4 max-w-4xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            {allMedia[selectedIdx].type === 'video' ? (
              <div className="relative">
                <video
                  src={allMedia[selectedIdx].url}
                  className="max-h-[80vh] w-auto max-w-full rounded-xl"
                  controls
                  autoPlay
                  muted={videoMuted}
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  >
                    {videoPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  >
                    {videoMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={allMedia[selectedIdx].url}
                alt={allMedia[selectedIdx].title}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
              />
            )}
            <p className="text-white text-sm font-medium text-center">{allMedia[selectedIdx].title}</p>
            <p className="text-white/50 text-xs">{selectedIdx + 1} / {allMedia.length}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}