export default function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-light-border dark:border-dark-border">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  border-b border-light-border dark:border-dark-border
                  hover:bg-gray-50 dark:hover:bg-dark-border/50
                  transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function TablePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-light-border dark:border-dark-border">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
