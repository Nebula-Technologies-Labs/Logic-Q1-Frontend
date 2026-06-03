import { useState } from "react";
import { Users, Building2, Clock, Plus } from "lucide-react";
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

const itemsPerPage = 5;

const defaultPersons: Person[] = [
  { id: "p1", firstName: "Alice", lastName: "Cooper", organization: "Cyberdyne", phones: [{ id: "ph1", number: "(555) 111-2222", type: "work" }], emails: [{ id: "em1", address: "alice@cyberdyne.com", type: "work" }], label: "Client", owner: "Sarah M.", visibleTo: "everyone" },
  { id: "p2", firstName: "Bob", lastName: "Marley", organization: "Massive Dynamic", phones: [{ id: "ph2", number: "(555) 333-4444", type: "work" }, { id: "ph3", number: "(555) 333-4445", type: "personal" }], emails: [{ id: "em2", address: "bob@massive.com", type: "work" }, { id: "em3", address: "bob@gmail.com", type: "personal" }], label: "Partner", owner: "John D.", visibleTo: "team" },
  { id: "p3", firstName: "Charlie", lastName: "Watts", organization: "Wayne Corp", phones: [{ id: "ph4", number: "(555) 555-6666", type: "work" }], emails: [{ id: "em4", address: "charlie@wayne.com", type: "work" }], label: "VIP", owner: "Sarah M.", visibleTo: "everyone" },
  { id: "p4", firstName: "Diana", lastName: "Prince", organization: "Themyscira", phones: [{ id: "ph5", number: "(555) 777-8888", type: "personal" }], emails: [{ id: "em5", address: "diana@themyscira.com", type: "work" }], label: "Client", owner: "Mike R.", visibleTo: "everyone" },
  { id: "p5", firstName: "Edward", lastName: "Nygma", organization: "Gotham Labs", phones: [{ id: "ph6", number: "(555) 999-0000", type: "work" }], emails: [{ id: "em6", address: "edward@gotham.com", type: "work" }, { id: "em7", address: "eddy@personal.com", type: "personal" }], label: "Supplier", owner: "John D.", visibleTo: "only_me" },
  { id: "p6", firstName: "Fiona", lastName: "Glenanne", organization: "Burn Notice", phones: [{ id: "ph8", number: "(555) 444-1111", type: "work" }], emails: [{ id: "em8", address: "fiona@burn.com", type: "work" }], label: "Internal", owner: "Sarah M.", visibleTo: "team" },
  { id: "p7", firstName: "George", lastName: "Kaplan", organization: "ION Inc", phones: [{ id: "ph9", number: "(555) 222-3333", type: "personal" }], emails: [{ id: "em9", address: "gkaplan@ion.com", type: "work" }], label: "None", owner: "", visibleTo: "everyone" },
  { id: "p8", firstName: "Helen", lastName: "Parr", organization: "Incredico", phones: [{ id: "ph10", number: "(555) 666-7777", type: "work" }, { id: "ph11", number: "(555) 666-7778", type: "personal" }], emails: [{ id: "em10", address: "hparr@incredico.com", type: "work" }], label: "Client", owner: "Mike R.", visibleTo: "everyone" },
];

const defaultOrganisations: Organisation[] = [
  { id: "o1", name: "Cyberdyne", industry: "Technology", phone: "(555) 111-0000", email: "info@cyberdyne.com", website: "", address: "", contacts: 3 },
  { id: "o2", name: "Massive Dynamic", industry: "Research", phone: "(555) 333-0000", email: "contact@massive.com", website: "", address: "", contacts: 5 },
  { id: "o3", name: "Wayne Corp", industry: "Manufacturing", phone: "(555) 555-0000", email: "hello@wayne.com", website: "", address: "", contacts: 2 },
  { id: "o4", name: "Gotham Labs", industry: "Pharmaceuticals", phone: "(555) 999-0000", email: "info@gothamlabs.com", website: "", address: "", contacts: 1 },
  { id: "o5", name: "Incredico", industry: "Insurance", phone: "(555) 666-0000", email: "support@incredico.com", website: "", address: "", contacts: 4 },
  { id: "o6", name: "Stark Industries", industry: "Defense", phone: "(555) 777-0000", email: "contact@stark.com", website: "", address: "", contacts: 7 },
];

const defaultTimeline: TimelineEvent[] = [
  { id: "t1", personName: "Alice Cooper", action: "Added", detail: "Added as new contact", timestamp: "2 hours ago" },
  { id: "t2", personName: "Bob Marley", action: "Updated", detail: "Phone number updated", timestamp: "5 hours ago" },
  { id: "t3", personName: "Charlie Watts", action: "Label changed", detail: "Label set to VIP", timestamp: "1 day ago" },
  { id: "t4", personName: "Diana Prince", action: "Note added", detail: "Follow up next quarter", timestamp: "2 days ago" },
  { id: "t5", personName: "Edward Nygma", action: "Email sent", detail: "Proposal sent via email", timestamp: "3 days ago" },
  { id: "t6", personName: "Fiona Glenanne", action: "Added", detail: "Added by Sarah M.", timestamp: "4 days ago" },
  { id: "t7", personName: "Helen Parr", action: "Meeting scheduled", detail: "Quarterly review - Q3", timestamp: "5 days ago" },
  { id: "t8", personName: "George Kaplan", action: "Updated", detail: "Organization changed to ION Inc", timestamp: "1 week ago" },
];

const columnSet: Record<Section, { key: string; label: string }[]> = {
  persons: [
    { key: "name", label: "Name" },
    { key: "organization", label: "Organization" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
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

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("persons");
  const [currentPage, setCurrentPage] = useState(1);

  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organisation | null>(null);

  const [persons, setPersons] = useLocalStorage<Person[]>("contacts_persons", defaultPersons);
  const [organisations, setOrganisations] = useLocalStorage<Organisation[]>("contacts_orgs", defaultOrganisations);
  const [timeline, setTimeline] = useLocalStorage<TimelineEvent[]>("contacts_timeline", defaultTimeline);

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

  const filteredPersons = filterData(persons, ["firstName", "lastName", "organization", "label", "owner"]);
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
    setPersonModalOpen(true);
  };

  const openEditPerson = (row: Record<string, unknown>) => {
    const item = persons.find((p) => p.id === row.id);
    if (item) {
      setEditingPerson(item);
      setPersonModalOpen(true);
    }
  };

  const handleSavePerson = (data: PersonFormData) => {
    if (editingPerson) {
      setPersons((prev) =>
        prev.map((p) =>
          p.id === editingPerson.id
            ? { ...p, firstName: data.firstName, lastName: data.lastName, organization: data.organization, phones: data.phones, emails: data.emails, label: data.label, owner: data.owner, visibleTo: data.visibleTo }
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
      };
      setPersons((prev) => [...prev, newPerson]);
      addTimelineEntry(timeline, setTimeline, `${data.firstName} ${data.lastName}`, "Added", "Added as new contact");
    }
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
    setOrgModalOpen(true);
  };

  const openEditOrg = (row: Record<string, unknown>) => {
    const item = organisations.find((o) => o.id === row.id);
    if (item) {
      setEditingOrg(item);
      setOrgModalOpen(true);
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

  const subHeader = (
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
                : "text-gray-600 hover:bg-gray-100"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Plus size={15} /> Add Person
          </button>
        )}
        {activeSection === "organisations" && (
          <button
            onClick={openAddOrg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Plus size={15} /> Add Organisation
          </button>
        )}
      </div>
    </div>
  );

  const footer = activeSection !== "timeline" ? (
    <div className="flex items-center justify-between px-5 py-2.5 text-sm">
      <p className="text-gray-400">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, activeSection === "persons" ? filteredPersons.length : filteredOrganisations.length)} of {activeSection === "persons" ? filteredPersons.length : filteredOrganisations.length} {activeSection === "persons" ? "persons" : "organisations"}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  ) : undefined;

  const rightPanelContent = () => {
    switch (activeSection) {
      case "persons":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact Labels</h3>
              <div className="space-y-2 text-sm">
                {["Client", "Partner", "Supplier", "Internal", "VIP"].map((group) => (
                  <div key={group} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
                    <span className="text-gray-300">{group}</span>
                    <span className="text-xs text-gray-500">{persons.filter((p) => p.label === group).length}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Visibility</h3>
              <div className="space-y-2 text-sm">
                {[
                  { key: "everyone", label: "Everyone" },
                  { key: "team", label: "Team" },
                  { key: "only_me", label: "Only me" },
                ].map((v) => (
                  <div key={v.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
                    <span className="text-gray-300">{v.label}</span>
                    <span className="text-xs text-gray-500">{persons.filter((p) => p.visibleTo === v.key).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "organisations":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Industries</h3>
              <div className="space-y-2 text-sm">
                {["Technology", "Research", "Manufacturing", "Pharmaceuticals", "Insurance", "Defense"].map((ind) => (
                  <div key={ind} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
                    <span className="text-gray-300">{ind}</span>
                    <span className="text-xs text-gray-500">{organisations.filter((o) => o.industry === ind).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "timeline":
        return (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800">
                <span className="text-gray-300">Total Events</span>
                <span className="text-xs text-gray-500">{timeline.length}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "persons":
        return (
          <div className="bg-white border border-gray-200">
            <Table columns={columnSet.persons} data={personRows} onEdit={openEditPerson} onDelete={handleDeletePerson} />
          </div>
        );
      case "organisations":
        return (
          <div className="bg-white border border-gray-200">
            <Table columns={columnSet.organisations} data={orgRows} onEdit={openEditOrg} onDelete={handleDeleteOrg} />
          </div>
        );
      case "timeline":
        return (
          <div className="bg-white border border-gray-200">
            <div className="divide-y divide-gray-100">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="p-1.5 rounded-full bg-blue-100 mt-0.5">
                    <Clock size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{event.personName}</span>
                      {" "}
                      <span className="text-gray-500">— {event.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{event.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      subHeader={subHeader}
      footer={footer}
      rightPanel={rightPanelContent()}
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      onAddNew={() => {
        if (activeSection === "organisations") openAddOrg();
        else openAddPerson();
      }}
    >
      <div className="p-5">
        {renderContent()}
      </div>
      {personModalOpen && (
        <ContactFormModal
          initialData={editingPerson ?? undefined}
          onClose={() => setPersonModalOpen(false)}
          onSave={handleSavePerson}
        />
      )}
      {orgModalOpen && (
        <OrganisationFormModal
          initialData={editingOrg ?? undefined}
          onClose={() => setOrgModalOpen(false)}
          onSave={handleSaveOrg}
        />
      )}
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

export default Contacts;
