export default function DataTable({ columns, data, emptyMessage = 'No data found', loading }) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-dark-100">
      <table className="w-full text-[14.5px]">
        <thead className="bg-dark-50 border-b border-dark-100">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-5 py-3.5 text-left text-[12px] font-semibold uppercase tracking-wider text-dark-500 whitespace-nowrap">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-dark-400">Loading...</td></tr>
          ) : data?.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-dark-400">{emptyMessage}</td></tr>
          ) : (
            data?.map((row, i) => (
              <tr key={row._id || i} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-5 py-3.5">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
