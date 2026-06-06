import { useState } from "react";

import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import ContactFormModal, { type PersonFormData } from "../../components/common/ContactFormModal";
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
    }
    setSlideOpen(false);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    const item = allData.find((d) => d.id === row.id);
    if (item) setDeletingItem(item);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      setAllData((prev) => prev.filter((d) => d.id !== deletingItem.id));
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
    <div className="flex items-center gap-2 px-5 py-2.5">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => handleFilterClick(f)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === f
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Sources</option>
          <option>Website</option>
          <option>Referral</option>
        </select>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between px-5 py-2.5 text-sm">
      <p className="text-gray-500">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} leads
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="p-5">
        <div className="bg-white border border-gray-200">
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