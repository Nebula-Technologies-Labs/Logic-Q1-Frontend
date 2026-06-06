import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Target, Building2, CheckSquare,
  Calendar, ChevronRight, Clock, Plus, Pencil, Trash2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  organization: string;
  status: string;
  label: string;
}

interface Organisation {
  id: string;
  name: string;
  industry: string;
}

interface TimelineEvent {
  id: string;
  personName: string;
  action: string;
  detail: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  createdAt: string;
}

const priorityStyles: Record<string, string> = {
  high: "bg-rose-50 text-rose-600 border-rose-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-sky-50 text-sky-600 border-sky-200",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  New: "bg-blue-50 text-blue-600",
  Inactive: "bg-gray-100 text-gray-500",
  Closed: "bg-gray-100 text-gray-500",
};

interface CardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
};

const Card = ({ label, value, icon: Icon, color }: CardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

const SectionHeader = ({ title, action, onAction }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    {action && (
      <button
        onClick={onAction}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
      >
        {action} <ChevronRight size={12} />
      </button>
    )}
  </div>
);

const defaultTasks: Task[] = [];

const Dashboad = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [persons] = useLocalStorage<Person[]>("contacts_persons", []);
  const [organisations] = useLocalStorage<Organisation[]>("contacts_orgs", []);
  const [timeline] = useLocalStorage<TimelineEvent[]>("contacts_timeline", []);
  const [tasks, setTasks] = useLocalStorage<Task[]>("dashboard_tasks", defaultTasks);

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const totalContacts = persons.length;
  const activeLeads = persons.filter((p) => ["New", "Active"].includes(p.status)).length;
  const totalOrganisations = organisations.length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  const statusData = [
    { name: "Active", count: persons.filter((p) => p.status === "Active").length },
    { name: "Pending", count: persons.filter((p) => p.status === "Pending").length },
    { name: "New", count: persons.filter((p) => p.status === "New").length },
    { name: "Inactive", count: persons.filter((p) => p.status === "Inactive").length },
    { name: "Closed", count: persons.filter((p) => p.status === "Closed").length },
  ].filter((d) => d.count > 0);

  const labelData = [
    { name: "Client", count: persons.filter((p) => p.label === "Client").length },
    { name: "Partner", count: persons.filter((p) => p.label === "Partner").length },
    { name: "Supplier", count: persons.filter((p) => p.label === "Supplier").length },
    { name: "Internal", count: persons.filter((p) => p.label === "Internal").length },
    { name: "VIP", count: persons.filter((p) => p.label === "VIP").length },
  ].filter((d) => d.count > 0);

  const recentActivity = [...timeline]
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 5);

  const sortedTasks = [...tasks]
    .filter((t) => t.status === "pending")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const completedTasks = tasks.filter((t) => t.status === "completed");

  const topContacts = [...persons]
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 5);

  const openAddTask = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskPriority("medium");
    setTaskFormOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate);
    setTaskPriority(task.priority);
    setTaskFormOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: taskTitle, description: taskDescription, dueDate: taskDueDate, priority: taskPriority }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
    }
    setTaskFormOpen(false);
  };

  const toggleTaskStatus = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const confirmDeleteTask = () => {
    if (deletingTask) {
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setDeletingTask(null);
    }
  };

  const kpiCards = [
    { label: "Total Contacts", value: totalContacts, icon: Users, color: "blue" },
    { label: "Active Leads", value: activeLeads, icon: Target, color: "green" },
    { label: "Organisations", value: totalOrganisations, icon: Building2, color: "purple" },
    { label: "Pending Tasks", value: pendingTasks, icon: CheckSquare, color: "orange" },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Layout
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      onAddNew={openAddTask}
    >
      <div className="p-5 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <Card key={card.label} {...card} />
          ))}
        </div>

        {statusData.length > 0 || labelData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <SectionHeader title="Contacts by Status" action="View All" onAction={() => navigate("/contacts")} />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--chart-tooltip-bg)",
                          border: "1px solid var(--chart-tooltip-border)",
                          borderRadius: "8px",
                          color: "var(--chart-tooltip-text)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {labelData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <SectionHeader title="Contacts by Label" action="View All" onAction={() => navigate("/contacts")} />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={labelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--chart-tooltip-bg)",
                          border: "1px solid var(--chart-tooltip-border)",
                          borderRadius: "8px",
                          color: "var(--chart-tooltip-text)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <SectionHeader title="Recent Activity" action="View All" onAction={() => navigate("/contacts")} />
            <div className="space-y-1">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No activity yet</p>
              ) : (
                recentActivity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <div className="p-1.5 rounded-full bg-blue-50 mt-0.5">
                      <Clock size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{event.personName}</span>{" "}
                        <span className="text-gray-500">— {event.action}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{event.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Tasks</h3>
              <button
                onClick={openAddTask}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Add Task
              </button>
            </div>
            <div className="space-y-1">
              {sortedTasks.length === 0 && completedTasks.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No tasks yet. Click "Add Task" to create one.</p>
              ) : (
                <>
                  {sortedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 group">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleTaskStatus(task)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} /> {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditTask(task)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingTask(task)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {completedTasks.length > 0 && (
                    <>
                      <div className="pt-2 pb-1">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Completed ({completedTasks.length})</p>
                      </div>
                      {completedTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 opacity-60">
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => toggleTaskStatus(task)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 line-through truncate">{task.title}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {topContacts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <SectionHeader title="Top Contacts" action="View All" onAction={() => navigate("/contacts")} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium">Name</th>
                    <th className="text-left py-2 pr-4 font-medium">Organization</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {topContacts.map((person) => (
                    <tr key={person.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">
                              {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {person.firstName} {person.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{person.organization || "-"}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[person.status] || "bg-gray-100 text-gray-500"}`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-500">{person.label || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <SlidePanel
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        title={editingTask ? "Edit Task" : "New Task"}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleSaveTask(); }}
          className="p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as "high" | "medium" | "low")}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setTaskFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
            >
              {editingTask ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </SlidePanel>

      {deletingTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask.title}"?`}
          onConfirm={confirmDeleteTask}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboad;
