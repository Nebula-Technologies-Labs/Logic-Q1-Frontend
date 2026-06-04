import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Target, DollarSign, TrendingUp,
  Calendar, ChevronRight, Building2, Clock, Plus
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import ContactFormModal, { type PersonFormData } from "../../components/common/ContactFormModal";
import OrganisationFormModal, { type OrganisationFormData } from "../../components/common/OrganisationFormModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  organization: string;
  phones: { id: string; number: string; type: "work" | "personal" }[];
  emails: { id: string; address: string; type: "work" | "personal" }[];
  label: string;
  owner: string;
  visibleTo: "everyone" | "only_me" | "team";
  status: string;
}

interface Organisation {
  id: string;
  name: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  contacts: number;
}

interface TimelineEvent {
  id: string;
  personName: string;
  action: string;
  detail: string;
  timestamp: string;
}

type Section = "persons" | "organisations" | "timeline";

const kpiCards = [
  { label: "Total Contacts", value: "2,847", change: "+12.5%", icon: Users, color: "blue" },
  { label: "Active Leads", value: "143", change: "+23.1%", icon: Target, color: "green" },
  { label: "Revenue", value: "$48,290", change: "+8.2%", icon: DollarSign, color: "purple" },
  { label: "Deals Won", value: "38", change: "+18.7%", icon: TrendingUp, color: "orange" },
];

const revenueData = [
  { month: "Jan", revenue: 28000, target: 25000 },
  { month: "Feb", revenue: 32000, target: 28000 },
  { month: "Mar", revenue: 29000, target: 30000 },
  { month: "Apr", revenue: 35000, target: 32000 },
  { month: "May", revenue: 42000, target: 35000 },
  { month: "Jun", revenue: 48290, target: 40000 },
];

const pipelineData = [
  { stage: "Lead", count: 86, value: 34000 },
  { stage: "Qualified", count: 52, value: 78000 },
  { stage: "Proposal", count: 28, value: 125000 },
  { stage: "Negotiation", count: 15, value: 98000 },
  { stage: "Closing", count: 8, value: 65000 },
];

const recentActivity = [
  { user: "Sarah Johnson", action: "added as lead", target: "Acme Corp", time: "2m ago" },
  { user: "Michael Brown", action: "updated contact", target: "John Smith", time: "15m ago" },
  { user: "Emily Davis", action: "converted to client", target: "TechStart Inc", time: "1h ago" },
  { user: "James Wilson", action: "sent a message", target: "Sarah Lee", time: "2h ago" },
  { user: "Lisa Anderson", action: "updated deal stage", target: "GlobalTech", time: "4h ago" },
  { user: "Robert Williams", action: "added note", target: "Project X", time: "5h ago" },
];

const tasks = [
  { title: "Follow up with Acme Corp", due: "Today", priority: "high" },
  { title: "Prepare Q2 report", due: "Tomorrow", priority: "medium" },
  { title: "Review proposal draft", due: "Tomorrow", priority: "medium" },
  { title: "Team standup meeting", due: "Today", priority: "low" },
  { title: "Update pipeline forecast", due: "Jun 10", priority: "high" },
];

const topContactsData = [
  { name: "Sarah Johnson", company: "Acme Corp", value: "$12,400", status: "Active" },
  { name: "Michael Brown", company: "TechStart Inc", value: "$8,900", status: "Active" },
  { name: "Emily Davis", company: "GlobalTech", value: "$6,700", status: "New" },
  { name: "James Wilson", company: "InnovateCo", value: "$5,200", status: "Active" },
  { name: "Lisa Anderson", company: "DataFlow", value: "$4,800", status: "Pending" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const priorityStyles: Record<string, string> = {
  high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-400",
  New: "bg-blue-500/10 text-blue-400",
};

const itemsPerPage = 5;

const columnSet: Record<Section, { key: string; label: string }[]> = {
  persons: [
    { key: "name", label: "Name" },
    { key: "organization", label: "Organization" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "label", label: "Label" },
    { key: "owner", label: "Owner" },
  ],
  organisations: [
    { key: "name", label: "Name" },
    { key: "industry", label: "Industry" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "contacts", label: "Contacts" },
  ],
  timeline: [],
};

const sectionIcons: Record<Section, typeof Users> = {
  persons: Users,
  organisations: Building2,
  timeline: Clock,
};

const defaultPersons: Person[] = [];
const defaultOrganisations: Organisation[] = [];
const defaultTimeline: TimelineEvent[] = [];

let _timelineId = 100;

const addTimelineEntry = (
  timeline: TimelineEvent[],
  setTimeline: (v: TimelineEvent[] | ((prev: TimelineEvent[]) => TimelineEvent[])) => void,
  personName: string,
  action: string,
  detail: string
) => {
  const now = new Date();
  const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  setTimeline([
    { id: String(_timelineId++), personName, action, detail, timestamp: label },
    ...timeline,
  ]);
};

interface CardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const Card = ({ label, value, change, icon: Icon, color }: CardProps) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-emerald-400 font-medium mt-1">{change} vs last month</p>
      </div>
      <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, action }: { title: string; action?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
    {action && (
      <button className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
        {action} <ChevronRight size={12} />
      </button>
    )}
  </div>
);

const Dashboad = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeSection, setActiveSection] = useState<Section>("persons");
  const [currentPage, setCurrentPage] = useState(1);

  const [personSlideOpen, setPersonSlideOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  const [orgSlideOpen, setOrgSlideOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organisation | null>(null);

  const [persons, setPersons] = useLocalStorage<Person[]>("contacts_persons", defaultPersons);
  const [organisations, setOrganisations] = useLocalStorage<Organisation[]>("contacts_orgs", defaultOrganisations);
  const [timeline, setTimeline] = useLocalStorage<TimelineEvent[]>("contacts_timeline", defaultTimeline);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const sections: { key: Section; label: string }[] = [
    { key: "persons", label: "Persons" },
    { key: "organisations", label: "Organisations" },
    { key: "timeline", label: "Timeline" },
  ];

  const filterData = <T,>(data: T[], searchFields: (keyof T)[]): T[] => {
    const q = searchQuery.toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  };

  const filteredPersons = filterData(persons, ["firstName", "lastName", "organization", "label", "owner", "status"]);
  const filteredOrganisations = filterData(organisations, ["name", "industry"]);

  const totalPages = Math.ceil(
    (activeSection === "persons" ? filteredPersons.length : filteredOrganisations.length) / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedPersons = filteredPersons.slice(startIndex, startIndex + itemsPerPage);
  const paginatedOrganisations = filteredOrganisations.slice(startIndex, startIndex + itemsPerPage);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setCurrentPage(1);
  };

  const openAddPerson = () => {
    setEditingPerson(null);
    setPersonSlideOpen(true);
  };

  const openEditPerson = (row: Record<string, unknown>) => {
    const item = persons.find((p) => p.id === row.id);
    if (item) {
      setEditingPerson(item);
      setPersonSlideOpen(true);
    }
  };

  const handleSavePerson = (data: PersonFormData) => {
    if (editingPerson) {
      setPersons((prev) =>
        prev.map((p) =>
          p.id === editingPerson.id
            ? { ...p, firstName: data.firstName, lastName: data.lastName, organization: data.organization, phones: data.phones, emails: data.emails, label: data.label, owner: data.owner, visibleTo: data.visibleTo, status: data.status }
            : p
        )
      );
      addTimelineEntry(timeline, setTimeline, `${data.firstName} ${data.lastName}`, "Updated", "Contact details updated");
    } else {
      const newPerson: Person = {
        id: String(Date.now()),
        firstName: data.firstName,
        lastName: data.lastName,
        organization: data.organization,
        phones: data.phones,
        emails: data.emails,
        label: data.label,
        owner: data.owner,
        visibleTo: data.visibleTo,
        status: data.status,
      };
      setPersons((prev) => [...prev, newPerson]);
      addTimelineEntry(timeline, setTimeline, `${data.firstName} ${data.lastName}`, "Added", "Added as new contact");
    }
    setPersonSlideOpen(false);
  };

  const handleDeletePerson = (row: Record<string, unknown>) => {
    const item = persons.find((p) => p.id === row.id);
    if (item) setDeletingPerson(item);
  };

  const confirmDeletePerson = () => {
    if (deletingPerson) {
      const name = `${deletingPerson.firstName} ${deletingPerson.lastName}`;
      setPersons((prev) => prev.filter((p) => p.id !== deletingPerson.id));
      addTimelineEntry(timeline, setTimeline, name, "Deleted", "Contact removed");
      setDeletingPerson(null);
    }
  };

  const openAddOrg = () => {
    setEditingOrg(null);
    setOrgSlideOpen(true);
  };

  const openEditOrg = (row: Record<string, unknown>) => {
    const item = organisations.find((o) => o.id === row.id);
    if (item) {
      setEditingOrg(item);
      setOrgSlideOpen(true);
    }
  };

  const handleSaveOrg = (data: OrganisationFormData) => {
    if (editingOrg) {
      setOrganisations((prev) =>
        prev.map((o) =>
          o.id === editingOrg.id ? { ...o, ...data } : o
        )
      );
      addTimelineEntry(timeline, setTimeline, data.name, "Updated", "Organisation details updated");
    } else {
      const newOrg: Organisation = {
        id: String(Date.now()),
        ...data,
        contacts: 0,
      };
      setOrganisations((prev) => [...prev, newOrg]);
      addTimelineEntry(timeline, setTimeline, data.name, "Added", "New organisation added");
    }
    setOrgSlideOpen(false);
  };

  const handleDeleteOrg = (row: Record<string, unknown>) => {
    const item = organisations.find((o) => o.id === row.id);
    if (item) setDeletingOrg(item);
  };

  const confirmDeleteOrg = () => {
    if (deletingOrg) {
      setOrganisations((prev) => prev.filter((o) => o.id !== deletingOrg.id));
      addTimelineEntry(timeline, setTimeline, deletingOrg.name, "Deleted", "Organisation removed");
      setDeletingOrg(null);
    }
  };

  const personRows = paginatedPersons.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    organization: p.organization,
    phone: p.phones[0]?.number ?? "-",
    email: p.emails[0]?.address ?? "-",
    status: p.status,
    label: p.label,
    owner: p.owner || "-",
  }));

  const orgRows = paginatedOrganisations.map((o) => ({
    id: o.id,
    name: o.name,
    industry: o.industry,
    phone: o.phone,
    email: o.email,
    contacts: o.contacts,
  }));

  const contactsSubHeader = (
    <div className="flex items-center gap-2 px-5 py-2.5">
      {sections.map(({ key, label }) => {
        const Icon = sectionIcons[key];
        return (
          <button
            key={key}
            onClick={() => handleSectionChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md ${
              activeSection === key
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        {activeSection === "persons" && (
          <button
            onClick={openAddPerson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-gray-700 rounded-md"
          >
            <Plus size={15} /> Add Person
          </button>
        )}
        {activeSection === "organisations" && (
          <button
            onClick={openAddOrg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-gray-700 rounded-md"
          >
            <Plus size={15} /> Add Organisation
          </button>
        )}
      </div>
    </div>
  );

  const contactsFooter = activeSection !== "timeline" ? (
    <div className="flex items-center justify-between px-5 py-2.5 text-sm">
      <p className="text-gray-400">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, activeSection === "persons" ? filteredPersons.length : filteredOrganisations.length)} of {activeSection === "persons" ? filteredPersons.length : filteredOrganisations.length}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-gray-400 hover:text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-xs rounded ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-gray-400 hover:text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  ) : undefined;

  const renderContactsContent = () => {
    switch (activeSection) {
      case "persons":
        return (
          <div className="bg-gray-800 border border-gray-700">
            <Table columns={columnSet.persons} data={personRows} onEdit={openEditPerson} onDelete={handleDeletePerson} />
          </div>
        );
      case "organisations":
        return (
          <div className="bg-gray-800 border border-gray-700">
            <Table columns={columnSet.organisations} data={orgRows} onEdit={openEditOrg} onDelete={handleDeleteOrg} />
          </div>
        );
      case "timeline":
        return (
          <div className="bg-gray-800 border border-gray-700">
            <div className="divide-y divide-gray-700">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="p-1.5 rounded-full bg-blue-900/30 mt-0.5">
                    <Clock size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100">
                      <span className="font-medium">{event.personName}</span>{" "}
                      <span className="text-gray-400">— {event.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{event.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      onAddNew={openAddPerson}
    >
      <div className="p-5 lg:p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <Card key={card.label} {...card} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-5">
            <SectionHeader title="Revenue Overview" action="View Report" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="target" stroke="#8b5cf6" fill="url(#targetGrad)" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <SectionHeader title="Pipeline by Stage" action="Details" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f3f4f6",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [value, "Deals"]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              {pipelineData.map(({ stage, value }) => (
                <div key={stage} className="flex justify-between text-xs text-gray-400">
                  <span>{stage}</span>
                  <span className="font-medium text-gray-300">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - Activity + Tasks/Top Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <SectionHeader title="Recent Activity" action="View All" />
            <div className="space-y-1">
              {recentActivity.map(({ user, action, target, time }) => (
                <div key={user + time} className="flex items-start gap-3 py-2.5 border-b border-gray-700/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-400">{user.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{user}</span>{" "}
                      {action}{" "}
                      <span className="font-medium text-gray-100">{target}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <SectionHeader title="Upcoming Tasks" action="View All" />
              <div className="space-y-1">
                {tasks.map(({ title, due, priority }) => (
                  <div key={title} className="flex items-center gap-3 py-2.5 border-b border-gray-700/50 last:border-0">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100 truncate">{title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {due}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${priorityStyles[priority]}`}>
                      {priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <SectionHeader title="Top Contacts" action="View All" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-700/50">
                      <th className="text-left py-2 pr-4 font-medium">Name</th>
                      <th className="text-left py-2 pr-4 font-medium">Company</th>
                      <th className="text-right py-2 pr-4 font-medium">Value</th>
                      <th className="text-right py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContactsData.map(({ name, company, value, status }) => (
                      <tr key={name} className="border-b border-gray-700/50 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-300">{name.charAt(0)}</span>
                            </div>
                            <span className="font-medium text-gray-100">{name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{company}</td>
                        <td className="py-3 pr-4 text-right font-medium text-gray-100">{value}</td>
                        <td className="py-3 text-right">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[status] || "bg-gray-500/10 text-gray-400"}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          {contactsSubHeader}
          <div className="p-5">
            {renderContactsContent()}
          </div>
          {contactsFooter}
        </div>
      </div>

      <ContactFormModal
        open={personSlideOpen}
        initialData={editingPerson ?? undefined}
        onClose={() => setPersonSlideOpen(false)}
        onSave={handleSavePerson}
      />
      <OrganisationFormModal
        open={orgSlideOpen}
        initialData={editingOrg ?? undefined}
        onClose={() => setOrgSlideOpen(false)}
        onSave={handleSaveOrg}
      />
      {deletingPerson && (
        <ConfirmDialog
          title="Delete Person"
          message={`Are you sure you want to delete "${deletingPerson.firstName} ${deletingPerson.lastName}"?`}
          onConfirm={confirmDeletePerson}
          onCancel={() => setDeletingPerson(null)}
        />
      )}
      {deletingOrg && (
        <ConfirmDialog
          title="Delete Organisation"
          message={`Are you sure you want to delete "${deletingOrg.name}"?`}
          onConfirm={confirmDeleteOrg}
          onCancel={() => setDeletingOrg(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboad;