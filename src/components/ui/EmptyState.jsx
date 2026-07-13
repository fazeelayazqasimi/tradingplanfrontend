import { FiInbox } from 'react-icons/fi';
import Button from './Button';

export default function EmptyState({ icon: Icon = FiInbox, title = 'No data', description = '', action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-dark-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-400" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-dark-500 mb-4 max-w-sm">{description}</p>}
      {action && onAction && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}
