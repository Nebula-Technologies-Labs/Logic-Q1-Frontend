interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  New: "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Inactive: "bg-gray-100 text-gray-600",
  Closed: "bg-red-100 text-red-800",
};

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 text-gray-900">
                  {col.render ? (
                    col.render(row)
                  ) : col.key === "status" ? (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColors[String(row[col.key])] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {String(row[col.key])}
                    </span>
                  ) : (
                    String(row[col.key] ?? "-")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
