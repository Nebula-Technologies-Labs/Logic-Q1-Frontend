import { useState } from "react";
import { Users, Clock, Plus } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import ContactFormModal, { type PersonFormData } from "../../components/common/ContactFormModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry } from "../../utils/activity";

interface Person {
  id: string; firstName: string; lastName: string; organization: string;
  phones: { id: string; number: string; type: "work" | "personal" }[];
  emails: { id: string; address: string; type: "work" | "personal" }[];
  owner: string; visibleTo: "everyone" | "only_me" | "team"; status: string;
}
interface TimelineEvent { id: string; personName: string; action: string; detail: string; timestamp: string; }
type Section = "persons" | "timeline";

const itemsPerPage = 5;
const defaultPersons: Person[] = [];
const defaultTimeline: TimelineEvent[] = [];

const columns = [
  { key: "name", label: "Name" }, { key: "organization", label: "Organization" },
  { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
  { key: "status", label: "Status" }, { key: "owner", label: "Owner" },
];

let _timelineId = 100;
const addTimelineEntry = (
  timeline: TimelineEvent[], setTimeline: (v: TimelineEvent[] | ((prev: TimelineEvent[]) => TimelineEvent[])) => void,
  personName: string, action: string, detail: string
) => {
  const now = new Date();
  const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  setTimeline([{ id: String(_timelineId++), personName, action, detail, timestamp: label }, ...timeline]);
};

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("persons");
  const [currentPage, setCurrentPage] = useState(1);

  const [personSlideOpen, setPersonSlideOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  const [persons, setPersons] = useLocalStorage<Person[]>("contacts_persons", defaultPersons);
  const [timeline, setTimeline] = useLocalStorage<TimelineEvent[]>("contacts_timeline", defaultTimeline);

  const sections: { key: Section; label: string }[] = [
    { key: "persons", label: "Persons" }, { key: "timeline", label: "Timeline" },
  ];

  const filterData = <T,>(data: T[], searchFields: (keyof T)[]): T[] => {
    const q = searchQuery.toLowerCase();
    if (!q) return data;
    return data.filter((item) => searchFields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)));
  };

  const filteredPersons = filterData(persons, ["firstName", "lastName", "organization", "owner", "status"]);
  const totalPages = Math.ceil((activeSection === "persons" ? filteredPersons.length : 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPersons = filteredPersons.slice(startIndex, startIndex + itemsPerPage);

  const handleSectionChange = (section: Section) => { setActiveSection(section); setCurrentPage(1); };

  const openAddPerson = () => { setEditingPerson(null); setPersonSlideOpen(true); };
  const openEditPerson = (row: Record<string, unknown>) => {
    const item = persons.find((p) => p.id === row.id);
    if (item) { setEditingPerson(item); setPersonSlideOpen(true); }
  };

  const handleSavePerson = (data: PersonFormData) => {
    if (editingPerson) {
      setPersons((prev) => prev.map((p) => p.id === editingPerson.id ? { ...p, ...data, id: editingPerson.id } : p));
      addTimelineEntry(timeline, setTimeline, `${data.firstName} ${data.lastName}`, "Updated", "Contact details updated");
      addActivityEntry(`Contact Updated: ${data.firstName} ${data.lastName}`, "Contact details updated", "lead");
    } else {
      const newPerson: Person = { ...data, id: String(Date.now()) };
      setPersons((prev) => [...prev, newPerson]);
      addTimelineEntry(timeline, setTimeline, `${data.firstName} ${data.lastName}`, "Added", "Added as new contact");
      addActivityEntry(`New Contact: ${data.firstName} ${data.lastName}`, data.organization || "No organization", "lead");
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
      addActivityEntry(`Contact Deleted: ${name}`, "Contact removed", "lead");
      setDeletingPerson(null);
    }
  };

  const personRows = paginatedPersons.map((p) => ({
    id: p.id, name: `${p.firstName} ${p.lastName}`, organization: p.organization,
    phone: p.phones[0]?.number ?? "-", email: p.emails[0]?.address ?? "-",
    status: p.status, owner: p.owner || "-",
  }));

  const subHeader = (
    <div className="flex items-center gap-2 px-6 py-3">
      {sections.map(({ key, label }) => {
        const Icon = key === "persons" ? Users : Clock;
        return (
          <button key={key} onClick={() => handleSectionChange(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-all ${
              activeSection === key ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface-variant hover:bg-surface-container-high"
            }`}>
            <Icon size={15} /> {label}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        <button onClick={openAddPerson}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-surface-container-high">
          <Plus size={15} /> Add Person
        </button>
      </div>
    </div>
  );

  const footer = activeSection !== "timeline" ? (
    <div className="flex items-center justify-between px-6 py-2.5 text-sm">
      <p className="text-on-surface-variant">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPersons.length)} of {filteredPersons.length}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="px-3 py-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-xs ${currentPage === page ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`}>{page}</button>
        ))}
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="px-3 py-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  ) : undefined;

  const rightPanelContent = () => {
    switch (activeSection) {
      case "persons":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Visibility</h3>
              <div className="space-y-2 text-sm">
                {[{ key: "everyone", label: "Everyone" }, { key: "team", label: "Team" }, { key: "only_me", label: "Only me" }].map((v) => (
                  <div key={v.key} className="flex items-center justify-between px-3 py-2 bg-surface-container">
                    <span className="text-on-surface">{v.label}</span>
                    <span className="text-xs text-on-surface-variant">{persons.filter((p) => p.visibleTo === v.key).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "timeline":
        return (
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Activity Summary</h3>
            <div className="px-3 py-2 bg-surface-container flex items-center justify-between">
              <span className="text-on-surface">Total Events</span>
              <span className="text-xs text-on-surface-variant">{timeline.length}</span>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "persons":
        return (
          <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
            <Table columns={columns} data={personRows} onEdit={openEditPerson} onDelete={handleDeletePerson} />
          </div>
        );
      case "timeline":
        return (
          <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
            <div className="divide-y divide-outline-variant">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-4 px-6 py-6">
                  <div className="w-8 h-8 bg-tertiary-fixed flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface">
                      <span className="font-bold">{event.personName}</span>
                      <span className="text-on-surface-variant"> — {event.action}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{event.detail}</p>
                  </div>
                  <span className="text-xs text-outline whitespace-nowrap">{event.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      subHeader={subHeader} footer={footer} rightPanel={rightPanelContent()}
      searchValue={searchQuery} onSearch={setSearchQuery}
      onAddNew={openAddPerson}
    >
      <div className="p-6">
        {renderContent()}
      </div>
      <ContactFormModal open={personSlideOpen} initialData={editingPerson ?? undefined}
        onClose={() => setPersonSlideOpen(false)} onSave={handleSavePerson} />
      {deletingPerson && (
        <ConfirmDialog title="Delete Person" message={`Are you sure you want to delete "${deletingPerson.firstName} ${deletingPerson.lastName}"?`}
          onConfirm={confirmDeletePerson} onCancel={() => setDeletingPerson(null)} />
      )}
    </Layout>
  );
};

export default Contacts;
