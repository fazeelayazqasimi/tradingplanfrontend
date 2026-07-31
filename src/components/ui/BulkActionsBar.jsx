import { FiTrash2, FiX } from 'react-icons/fi';
import Button from './Button';

export default function BulkActionsBar({ selectedCount = 0, onClear, onDelete, deleting = false, confirmMessage = 'Delete selected items?' }) {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink text-white rounded-2xl shadow-2xl px-4 py-3">
      <span className="text-sm font-semibold whitespace-nowrap">{selectedCount} selected</span>
      <Button size="sm" variant="danger" loading={deleting} disabled={deleting}
        onClick={() => {
          if (window.confirm(confirmMessage)) onDelete();
        }}>
        <FiTrash2 size={14} className="mr-1" /> Delete
      </Button>
      <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Clear selection">
        <FiX size={15} />
      </button>
    </div>
  );
}
