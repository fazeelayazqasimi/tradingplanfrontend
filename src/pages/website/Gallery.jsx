import { useState, useEffect, useCallback } from 'react';
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(null);

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

  const allImages = items.flatMap(item =>
    (item.images || []).map(img => ({
      url: img.startsWith('http') ? img : `${API_URL}/${img}`,
      title: item.title,
    }))
  );

  const goNext = useCallback(() => {
    setSelectedIdx(prev => prev === null ? null : (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setSelectedIdx(prev => prev === null ? null : (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ink">Gallery</h1>
        <p className="mt-2 text-dark-500">Photos and media from our trading community</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : allImages.length === 0 ? (
        <EmptyState icon={FiImage} title="No images yet" message="Gallery images will appear here once uploaded." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allImages.map((img, idx) => (
            <button
              key={idx}
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
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{img.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

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
            <img
              src={allImages[selectedIdx].url}
              alt={allImages[selectedIdx].title}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
            />
            <p className="text-white text-sm font-medium text-center">{allImages[selectedIdx].title}</p>
            <p className="text-white/50 text-xs">{selectedIdx + 1} / {allImages.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
