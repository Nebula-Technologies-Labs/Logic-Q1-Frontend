import { useState } from "react";
import { Calendar, Plus, Pencil, Trash2, ListTodo } from "lucide-react";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry } from "../../utils/activity";

interface Task {
  id: string; title: string; description: string; dueDate: string;
  priority: "high" | "medium" | "low"; status: "pending" | "completed"; createdAt: string;
}

const defaultTasks: Task[] = [];
const priorityStyles: Record<string, string> = {
  high: "bg-error-container text-error",
  medium: "bg-tertiary-fixed text-tertiary",
  low: "bg-secondary-container text-secondary",
};

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useLocalStorage<Task[]>("dashboard_tasks", defaultTasks);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  }).sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    if (!a.dueDate) return 1; if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const openAdd = () => {
    setEditing(null); setTitle(""); setDescription(""); setDueDate(""); setPriority("medium"); setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task); setTitle(task.title); setDescription(task.description);
    setDueDate(task.dueDate); setPriority(task.priority); setFormOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (editing) {
      setTasks((prev) => prev.map((t) => t.id === editing.id ? { ...t, title, description, dueDate, priority } : t));
      addActivityEntry(`Task Updated: ${title}`, description || "No description", "task");
    } else {
      setTasks((prev) => [...prev, { id: String(Date.now()), title, description, dueDate, priority, status: "pending" as const, createdAt: new Date().toISOString() }]);
      addActivityEntry(`New Task: ${title}`, description || "No description", "task");
    }
    setFormOpen(false);
  };

  const toggleStatus = (task: Task) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t));
    if (task.status !== "completed") {
      addActivityEntry(`Task Completed: ${task.title}`, task.description || "No description", "task");
    } else {
      addActivityEntry(`Task Reopened: ${task.title}`, task.description || "No description", "task");
    }
  };

  const confirmDelete = () => {
    if (deleting) { setTasks((prev) => prev.filter((t) => t.id !== deleting.id)); addActivityEntry(`Task Deleted: ${deleting.title}`, deleting.description || "No description", "task"); setDeleting(null); }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr); const today = new Date(); const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <Layout searchValue={searchQuery} onSearch={setSearchQuery} onAddNew={openAdd}>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Task Management</h2>
            <p className="text-body-lg text-on-surface-variant mt-1">{pendingCount} pending · {completedCount} completed</p>
          </div>
          <button onClick={openAdd} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2">
            <Plus size={18} /> New Task
          </button>
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-md py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                filter === f ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface-variant hover:bg-surface-container-high"
              }`}>{f === "all" ? "All Tasks" : f}</button>
          ))}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-6 space-y-1">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider pb-3 px-3 border-b border-outline-variant">
              <div className="col-span-1" />
              <div className="col-span-4">Task</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1" />
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <ListTodo size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : filteredTasks.map((task) => (
              <div key={task.id} className={`grid grid-cols-12 gap-4 items-center px-3 py-6 hover:bg-surface-container-low transition-colors rounded-lg group ${task.status === "completed" ? "opacity-60" : ""}`}>
                <div className="col-span-1">
                  <input type="checkbox" checked={task.status === "completed"} onChange={() => toggleStatus(task)}
                    className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer" />
                </div>
                <div className="col-span-4">
                  <p className={`text-sm font-bold text-on-surface ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{task.description}</p>}
                </div>
                <div className="col-span-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${priorityStyles[task.priority]}`}>{task.priority}</span>
                </div>
                <div className="col-span-2 text-sm text-on-surface-variant flex items-center gap-1">
                  <Calendar size={14} /> {formatDate(task.dueDate)}
                </div>
                <div className="col-span-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    task.status === "completed" ? "bg-tertiary-fixed text-tertiary" : "bg-secondary-container text-secondary"
                  }`}>{task.status}</span>
                </div>
                <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(task)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleting(task)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-error">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SlidePanel open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Task" : "New Task"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Task title" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
            <button type="button" onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-body-md font-medium text-on-primary bg-primary hover:opacity-90 rounded-lg transition-all shadow-sm">{editing ? "Update" : "Save"}</button>
          </div>
        </form>
      </SlidePanel>

      {deleting && (
        <ConfirmDialog title="Delete Task" message={`Are you sure you want to delete "${deleting.title}"?`}
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </Layout>
  );
};

export default Tasks;
