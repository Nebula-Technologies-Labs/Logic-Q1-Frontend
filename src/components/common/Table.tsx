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
  Active: "bg-primary-container/20 text-primary",
  New: "bg-secondary-container text-secondary",
  Pending: "bg-tertiary-fixed text-tertiary",
  Inactive: "bg-surface-variant text-on-surface-variant",
  Closed: "bg-surface-variant text-on-surface-variant",
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
          <tr className="border-b border-outline-variant bg-surface-container-lowest">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-6 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="text-right px-6 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wider w-20">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3 text-on-surface">
                  {col.render ? (
                    col.render(row)
                  ) : col.key === "status" ? (
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[String(row[col.key])] ||
                        "bg-surface-variant text-on-surface-variant"
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
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-error"
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
