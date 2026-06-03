import { Pencil, Trash2 } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

const statusStyles: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  New: "bg-gray-100 text-gray-700",
  Pending: "bg-gray-200 text-gray-600",
  Inactive: "bg-gray-100 text-gray-400",
  Closed: "bg-gray-200 text-gray-500",
};

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
}: TableProps<T>) => {
  const hasActions = !!onEdit || !!onDelete;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="text-right px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider w-20">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3 text-gray-900">
                  {col.render ? (
                    col.render(row)
                  ) : col.key === "status" ? (
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[String(row[col.key])] ||
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
              {hasActions && (
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
