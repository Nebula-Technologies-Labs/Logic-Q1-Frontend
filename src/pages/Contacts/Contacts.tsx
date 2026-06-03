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

const itemsPerPage = 5;

const defaultPersons: Person[] = [];

const defaultOrganisations: Organisation[] = [];

const defaultTimeline: TimelineEvent[] = [];

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
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
          >
            <Plus size={15} /> Add Person
          </button>
        )}
        {activeSection === "organisations" && (
          <button
            onClick={openAddOrg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Table columns={columnSet.persons} data={personRows} onEdit={openEditPerson} onDelete={handleDeletePerson} />
          </div>
        );
      case "organisations":
        return (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Table columns={columnSet.organisations} data={orgRows} onEdit={openEditOrg} onDelete={handleDeleteOrg} />
          </div>
        );
      case "timeline":
        return (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 mt-0.5">
                    <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">{event.personName}</span>
                      {" "}
                      <span className="text-gray-500 dark:text-gray-400">— {event.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{event.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{event.timestamp}</span>
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
