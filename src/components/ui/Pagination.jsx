import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-dark-200 hover:bg-dark-50 disabled:opacity-50 transition-colors"><FiChevronLeft size={16} /></button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) pageNum = i + 1;
        else if (page <= 3) pageNum = i + 1;
        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
        else pageNum = page - 2 + i;
        return (
          <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pageNum === page ? 'bg-primary-500 text-white' : 'hover:bg-dark-100 text-dark-600'}`}>{pageNum}</button>
        );
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg border border-dark-200 hover:bg-dark-50 disabled:opacity-50 transition-colors"><FiChevronRight size={16} /></button>
    </div>
  );
}
