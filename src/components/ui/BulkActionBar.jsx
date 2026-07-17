import { FiTrash2, FiX } from 'react-icons/fi';
import Button from './Button';

export default function BulkActionBar({ selectedCount, onDelete, onClear, loading }) {
  if (selectedCount === 0) return null;
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 px-5 py-3 bg-white border border-red-200 rounded-[14px] shadow-lg shadow-red-500/10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink">
          {selectedCount} selected
        </span>
        <button onClick={onClear} className="p-1 rounded-md hover:bg-dark-100 text-dark-400 hover:text-dark-600 transition-colors">
          <FiX size={16} />
        </button>
      </div>
      <Button variant="danger" size="sm" onClick={onDelete} loading={loading}>
        <FiTrash2 size={14} />
        Delete Selected
      </Button>
    </div>
  );
}
