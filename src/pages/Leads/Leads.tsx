import { useState } from "react";

import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import ContactFormModal, { type PersonFormData } from "../../components/common/ContactFormModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";
import { addActivityEntry } from "../../utils/activity";

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

const columns = [
  { key: "name", label: "Name" },
  { key: "organization", label: "Organization" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const itemsPerPage = 5;

const leadStatuses = ["New", "Active"];

const defaultData: Person[] = [];

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Leads");
  const [currentPage, setCurrentPage] = useState(1);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Person | null>(null);
  const [deletingItem, setDeletingItem] = useState<Person | null>(null);

  const [allData, setAllData] = useLocalStorage<Person[]>("contacts_persons", defaultData);

  const leads = allData.filter((p) => leadStatuses.includes(p.status));

  const filters = ["All Leads", "New", "Active"];

  const filteredData = leads.filter((row) => {
    const matchesFilter = activeFilter === "All Leads" || row.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(q) ||
      row.organization.toLowerCase().includes(q) ||
      row.emails[0]?.address.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterClick = (f: string) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const openAdd = () => {
    setEditingItem(null);
    setSlideOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const item = allData.find((d) => d.id === row.id);
    if (item) {
      setEditingItem(item);
      setSlideOpen(true);
    }
  };

  const handleSave = (data: PersonFormData) => {
    if (editingItem) {
      setAllData((prev) =>
        prev.map((d) =>
          d.id === editingItem.id
            ? { ...d, firstName: data.firstName, lastName: data.lastName, organization: data.organization, phones: data.phones, emails: data.emails, label: data.label, owner: data.owner, visibleTo: data.visibleTo, status: data.status }
            : d
        )
      );
      addActivityEntry(`Lead Updated: ${data.firstName} ${data.lastName}`, data.organization || "No organization", "lead");
    } else {
      setAllData((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          firstName: data.firstName,
          lastName: data.lastName,
          organization: data.organization,
          phones: data.phones,
          emails: data.emails,
          label: data.label,
          owner: data.owner,
          visibleTo: data.visibleTo,
          status: "New",
        },
      ]);
      addActivityEntry(`New Lead: ${data.firstName} ${data.lastName}`, data.organization || "No organization", "lead");
    }
    setSlideOpen(false);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    const item = allData.find((d) => d.id === row.id);
    if (item) setDeletingItem(item);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      const name = `${deletingItem.firstName} ${deletingItem.lastName}`;
      setAllData((prev) => prev.filter((d) => d.id !== deletingItem.id));
      addActivityEntry(`Lead Deleted: ${name}`, "Lead removed", "lead");
      setDeletingItem(null);
    }
  };

  const rows = paginatedData.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    organization: p.organization,
    phone: p.phones[0]?.number ?? "-",
    email: p.emails[0]?.address ?? "-",
    status: p.status,
  }));

  const subHeader = (
    <div className="flex items-center gap-2 px-6 py-3">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => handleFilterClick(f)}
          className={`px-md py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeFilter === f
              ? "bg-primary-container text-on-primary-container font-bold"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <select className="px-4 py-1.5 text-sm border border-outline-variant rounded-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option>All Sources</option>
          <option>Website</option>
          <option>Referral</option>
        </select>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between px-6 py-2.5 text-sm">
      <p className="text-on-surface-variant">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} leads
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-xs rounded ${
              currentPage === page
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <Layout
      subHeader={subHeader}
      footer={footer}
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      onAddNew={openAdd}
    >
      <div className="p-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <Table columns={columns} data={rows} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>
      <ContactFormModal
        open={slideOpen}
        initialData={editingItem ?? undefined}
        onClose={() => setSlideOpen(false)}
        onSave={handleSave}
      />
      {deletingItem && (
        <ConfirmDialog
          title="Delete Lead"
          message={`Are you sure you want to delete "${deletingItem.firstName} ${deletingItem.lastName}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </Layout>
  );
};

export default Leads;
