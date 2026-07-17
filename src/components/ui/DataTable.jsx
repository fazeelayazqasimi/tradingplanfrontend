import { FiTrash2 } from 'react-icons/fi';

export default function DataTable({ columns, data, emptyMessage = 'No data found', loading, selectable, selectedIds, onSelect, onSelectAll }) {
  const allSelected = data?.length > 0 && selectedIds?.length === data?.length;
  return (
    <div className="overflow-x-auto rounded-[18px] border border-dark-100">
      <table className="w-full text-[14.5px]">
        <thead className="bg-dark-50 border-b border-dark-100">
          <tr>
            {selectable && (
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onSelectAll?.(allSelected ? [] : data.map(r => r._id || r.id))}
                  className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th key={i} className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-dark-500 whitespace-nowrap">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="px-5 py-12 text-center text-dark-400">Loading...</td></tr>
          ) : data?.length === 0 ? (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="px-5 py-12 text-center text-dark-400">{emptyMessage}</td></tr>
          ) : (
            data?.map((row, i) => {
              const rowId = row._id || row.id;
              const checked = selectedIds?.includes(rowId);
              return (
                <tr key={rowId || i} className={`border-b border-dark-50 hover:bg-dark-50/50 transition-colors ${checked ? 'bg-primary-50/50' : ''}`}>
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onSelect?.(rowId)}
                        className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, j) => (
                    <td key={j} className="px-5 py-3.5">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
