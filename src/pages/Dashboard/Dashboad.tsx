import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Target, Building2, CheckSquare,
  Calendar, Clock, Plus, Pencil, Trash2, TrendingUp, TrendingDown, ChevronRight,
  LayoutDashboard
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry } from "../../utils/activity";
import { usePreferences } from "../../hooks/usePreferences";
import { useDateRange, rangeLabels, rangeValues, type DateRangeValue } from "../../hooks/useDateRange";

interface Person { id: string; firstName: string; lastName: string; organization: string; status: string; label: string; createdAt?: string; }
interface Organisation { id: string; name: string; industry: string; }
interface TimelineEvent { id: string; personName: string; action: string; detail: string; timestamp: string; }
interface Task {
  id: string; title: string; description: string; dueDate: string;
  priority: "high" | "medium" | "low"; status: "pending" | "completed"; createdAt: string;
}

const priorityStyles: Record<string, string> = {
  high: "bg-error-container text-error",
  medium: "bg-tertiary-fixed text-tertiary",
  low: "bg-secondary-container text-secondary",
};

const defaultTasks: Task[] = [];

const Dashboad = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { preferences, updatePreference } = usePreferences();
  const { range, label: rangeLabel, filterByDate } = useDateRange(preferences.dateRange);

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

  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const filteredPersons = filterByDate(persons);
  const filteredOrganisations = filterByDate(organisations);
  const filteredTimeline = filterByDate(timeline);
  const filteredTasks = filterByDate(tasks);

  const totalContacts = filteredPersons.length;
  const activeLeads = filteredPersons.filter((p) => ["New", "Active"].includes(p.status)).length;
  const totalOrganisations = filteredOrganisations.length;
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending").length;

  const hasData = totalContacts > 0 || totalOrganisations > 0 || pendingTasks > 0;

  const statusData = [
    { name: "Active", count: filteredPersons.filter((p) => p.status === "Active").length },
    { name: "Pending", count: filteredPersons.filter((p) => p.status === "Pending").length },
    { name: "New", count: filteredPersons.filter((p) => p.status === "New").length },
    { name: "Inactive", count: filteredPersons.filter((p) => p.status === "Inactive").length },
    { name: "Closed", count: filteredPersons.filter((p) => p.status === "Closed").length },
  ].filter((d) => d.count > 0);

  const labelData = [
    { name: "Client", count: filteredPersons.filter((p) => p.label === "Client").length },
    { name: "Partner", count: filteredPersons.filter((p) => p.label === "Partner").length },
    { name: "Supplier", count: filteredPersons.filter((p) => p.label === "Supplier").length },
    { name: "Internal", count: filteredPersons.filter((p) => p.label === "Internal").length },
    { name: "VIP", count: filteredPersons.filter((p) => p.label === "VIP").length },
  ].filter((d) => d.count > 0);

  const recentActivity = [...filteredTimeline].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 5);
  const sortedTasks = [...filteredTasks].filter((t) => t.status === "pending").sort((a, b) => {
    if (!a.dueDate) return 1; if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const openAddTask = () => {
    setEditingTask(null); setTaskTitle(""); setTaskDescription(""); setTaskDueDate(""); setTaskPriority("medium");
    setTaskFormOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task); setTaskTitle(task.title); setTaskDescription(task.description);
    setTaskDueDate(task.dueDate); setTaskPriority(task.priority); setTaskFormOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;
    if (editingTask) {
      setTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, title: taskTitle, description: taskDescription, dueDate: taskDueDate, priority: taskPriority } : t));
      addActivityEntry(`Task Updated: ${taskTitle}`, taskDescription || "No description", "task");
    } else {
      setTasks((prev) => [...prev, {
        id: String(Date.now()), title: taskTitle, description: taskDescription,
        dueDate: taskDueDate, priority: taskPriority, status: "pending" as const, createdAt: new Date().toISOString(),
      }]);
      addActivityEntry(`New Task: ${taskTitle}`, taskDescription || "No description", "task");
    }
    setTaskFormOpen(false);
  };

  const toggleTaskStatus = (task: Task) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t));
    if (task.status !== "completed") {
      addActivityEntry(`Task Completed: ${task.title}`, task.description || "No description", "task");
    } else {
      addActivityEntry(`Task Reopened: ${task.title}`, task.description || "No description", "task");
    }
  };

  const confirmDeleteTask = () => {
    if (deletingTask) { setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id)); addActivityEntry(`Task Deleted: ${deletingTask.title}`, deletingTask.description || "No description", "task"); setDeletingTask(null); }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr); const today = new Date(); const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Layout searchValue={searchQuery} onSearch={setSearchQuery} onAddNew={openAddTask}>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Dashboard</h2>
            <p className="text-body-lg text-on-surface-variant mt-1">Overview of your CRM data.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-body-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <Calendar size={18} /> {rangeLabel}
              </button>
              {rangeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRangeDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 z-20 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl overflow-hidden min-w-[14rem]">
                    {rangeValues.map((val) => (
                      <button
                        key={val}
                        onClick={() => { updatePreference("dateRange", val); setRangeDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          preferences.dateRange === val
                            ? "bg-primary-container text-on-primary-container font-bold"
                            : "text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        {rangeLabels[val]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={openAddTask} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2">
              <Plus size={18} /> New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Contacts", value: totalContacts, icon: Users },
            { label: "Active Leads", value: activeLeads, icon: Target },
            { label: "Organisations", value: totalOrganisations, icon: Building2 },
            { label: "Pending Tasks", value: pendingTasks, icon: CheckSquare },
          ].map((card) => (
            <div key={card.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/5 text-primary rounded-lg">
                  <card.icon size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant text-label-sm uppercase tracking-wider">{card.label}</p>
                <h3 className="text-headline-md font-headline-md text-on-surface mt-base">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {!hasData ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard size={32} className="text-outline" />
              </div>
              <h3 className="text-title-md font-title-md text-on-surface mb-2">Welcome to Logic Q1</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Get started by adding your first contacts and tasks. Your dashboard will populate with insights as you add data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate("/contacts")} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all">
                  Add Contacts
                </button>
                <button onClick={openAddTask} className="px-6 py-2.5 border border-outline-variant text-on-surface rounded-lg text-body-md font-medium hover:bg-surface-container transition-all">
                  Create Task
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
                {statusData.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h4 className="text-title-md font-title-md text-on-surface">Contacts by Status</h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-base">
                          <span className="w-3 h-3 bg-primary rounded-full" />
                          <span className="text-xs text-on-surface-variant">Count</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d6" strokeOpacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff", border: "1px solid #c3c6d6",
                              borderRadius: "8px", color: "#051a3e", fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="count" fill="#003d9b" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-on-surface-variant">
                    No contact status data for this period
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-title-md font-title-md text-on-surface">Recent Activity</h4>
                  <button onClick={() => navigate("/activity")} className="text-outline cursor-pointer hover:text-primary">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-4">No activity yet</p>
                  ) : recentActivity.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-tertiary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{event.personName}</p>
                        <p className="text-xs text-on-surface-variant">{event.action} — {event.detail}</p>
                        <span className="text-[10px] text-outline">{event.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/activity")} className="mt-6 w-full py-2 text-primary font-bold text-sm border-t border-outline-variant pt-4 hover:underline">
                  View Full History
                </button>
              </div>
            </div>

            {labelData.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
                <h4 className="text-title-md font-title-md text-on-surface">Contacts by Label</h4>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={labelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d6" strokeOpacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#737685" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #c3c6d6", borderRadius: "8px", color: "#051a3e", fontSize: "12px" }} />
                      <Bar dataKey="count" fill="#0052cc" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-title-md font-title-md text-on-surface">Upcoming Tasks</h4>
            <button onClick={openAddTask} className="text-primary text-sm font-bold hover:underline flex items-center gap-2">
              <Plus size={16} /> Add Task
            </button>
          </div>
          <div className="p-6">
            {sortedTasks.length === 0 && completedTasks.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4">No tasks yet.</p>
            ) : (
              <div className="divide-y divide-outline-variant">
                {sortedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 py-6 group">
                    <input type="checkbox" checked={false} onChange={() => toggleTaskStatus(task)}
                      className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">{task.title}</p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Calendar size={12} /> {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditTask(task)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeletingTask(task)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-error">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {completedTasks.length > 0 && (
                  <>
                    <div className="pt-2 pb-1">
                      <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Completed ({completedTasks.length})</p>
                    </div>
                    {completedTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-4 py-6 opacity-60">
                        <input type="checkbox" checked={true} onChange={() => toggleTaskStatus(task)}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface line-through">{task.title}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SlidePanel open={taskFormOpen} onClose={() => setTaskFormOpen(false)} title={editingTask ? "Edit Task" : "New Task"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTask(); }} className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Title</label>
            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Task title" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Due Date</label>
            <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Priority</label>
            <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as "high" | "medium" | "low")}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
            <button type="button" onClick={() => setTaskFormOpen(false)}
              className="px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-body-md font-medium text-on-primary bg-primary hover:opacity-90 rounded-lg transition-all shadow-sm">{editingTask ? "Update" : "Save"}</button>
          </div>
        </form>
      </SlidePanel>

      {deletingTask && (
        <ConfirmDialog title="Delete Task" message={`Are you sure you want to delete "${deletingTask.title}"?`}
          onConfirm={confirmDeleteTask} onCancel={() => setDeletingTask(null)} />
      )}
    </Layout>
  );
};

export default Dashboad;
