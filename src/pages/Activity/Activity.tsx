import { useState } from "react";
import { Clock, Handshake, Mail, Plus, User, Calendar } from "lucide-react";
import Layout from "../../components/layout/Layout";
import SlidePanel from "../../components/common/SlidePanel";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry, type ActivityEvent } from "../../utils/activity";

const iconMap: Record<string, typeof Clock> = { deal: Handshake, email: Mail, task: Clock, lead: User };
const bgMap: Record<string, string> = {
  deal: "bg-tertiary-fixed", email: "bg-secondary-container", task: "bg-surface-container", lead: "bg-tertiary-fixed",
};
const iconClassMap: Record<string, string> = {
  deal: "text-tertiary", email: "text-primary", task: "text-outline", lead: "text-tertiary",
};

const defaultActivities: ActivityEvent[] = [];

const Activity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [activities, setActivities] = useLocalStorage<ActivityEvent[]>("pipeline_activity", defaultActivities);

  const [formOpen, setFormOpen] = useState(false);
  const [actType, setActType] = useState("deal");
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actPerson, setActPerson] = useState("");

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);
  const filterBtns = [
    { key: "all", label: "All Activity" },
    { key: "deal", label: "Deals" },
    { key: "email", label: "Emails" },
    { key: "task", label: "Tasks" },
    { key: "lead", label: "Leads" },
  ];

  const openLog = () => {
    setActType("deal"); setActTitle(""); setActDesc(""); setActPerson(""); setFormOpen(true);
  };

  const handleSave = () => {
    if (!actTitle.trim()) return;
    addActivityEntry(actTitle, actDesc, actType);
    const raw = localStorage.getItem("pipeline_activity");
    if (raw) {
      try { setActivities(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setFormOpen(false);
  };

  return (
    <Layout searchValue={searchQuery} onSearch={setSearchQuery} onAddNew={openLog}>
      <div className="p-6 max-w-[1440px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Activity Timeline</h2>
            <p className="text-body-lg text-on-surface-variant mt-1">Track all interactions and updates across your CRM.</p>
          </div>
          <button onClick={openLog} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2">
            <Plus size={18} /> Log Activity
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {filterBtns.map((btn) => (
              <button key={btn.key} onClick={() => setFilter(btn.key)}
                className={`px-md py-1.5 text-sm font-medium rounded-lg transition-all ${
                  filter === btn.key ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}>{btn.label}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-on-surface-variant">
            <Calendar size={16} />
            <span className="text-sm">{activities.length} total events</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="divide-y divide-outline-variant">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <p className="text-sm">No activity yet. Log your first activity or create contacts and tasks to populate this feed.</p>
              </div>
            ) : filtered.map((activity, i) => {
              const Icon = iconMap[activity.type] || Clock;
              const bg = bgMap[activity.type] || "bg-surface-container";
              const iconCls = iconClassMap[activity.type] || "text-outline";
              return (
                <div key={activity.id} className="flex items-start gap-4 px-6 py-6 hover:bg-surface-container-low transition-colors">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={iconCls} />
                    </div>
                    {i < filtered.length - 1 && <div className="w-px flex-1 bg-outline-variant mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-bold text-on-surface">{activity.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{activity.description}</p>
                    <p className="text-[10px] text-outline mt-0.5">{activity.person}</p>
                  </div>
                  <span className="text-xs text-outline whitespace-nowrap pt-1">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SlidePanel open={formOpen} onClose={() => setFormOpen(false)} title="Log Activity">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Type</label>
            <select value={actType} onChange={(e) => setActType(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              <option value="deal">Deal</option><option value="email">Email</option>
              <option value="task">Task</option><option value="lead">Lead</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Title</label>
            <input type="text" value={actTitle} onChange={(e) => setActTitle(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Description</label>
            <textarea value={actDesc} onChange={(e) => setActDesc(e.target.value)} rows={3}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Person</label>
            <input type="text" value={actPerson} onChange={(e) => setActPerson(e.target.value)}
              className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
            <button type="button" onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-body-md font-medium text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-body-md font-medium text-on-primary bg-primary hover:opacity-90 rounded-lg transition-all shadow-sm">Save</button>
          </div>
        </form>
      </SlidePanel>
    </Layout>
  );
};

export default Activity;
