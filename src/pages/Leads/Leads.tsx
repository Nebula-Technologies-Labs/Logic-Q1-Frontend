import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";

interface LeadItem extends Record<string, unknown> {
  id: string;
  name: string;
  organization: string;
  phone: string;
  email: string;
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

const leadStats = [
  { label: "Conversion Rate", value: "23%", trend: "up", change: "+5%" },
  { label: "Avg Deal Size", value: "$4,500", trend: "up", change: "+12%" },
  { label: "Win Rate", value: "41%", trend: "down", change: "-3%" },
];

const defaultData: LeadItem[] = [
  { id: "l1", name: "Carol White", organization: "Oscorp", phone: "(555) 555-6666", email: "carol@oscorp.com", status: "New" },
  { id: "l2", name: "Dan Green", organization: "LexCorp", phone: "(555) 777-8888", email: "dan@lexcorp.com", status: "Pending" },
  { id: "l3", name: "Eve Black", organization: "SPECTRE", phone: "(555) 999-0000", email: "eve@spectre.com", status: "Active" },
  { id: "l4", name: "Frank Castle", organization: "S.H.I.E.L.D.", phone: "(555) 444-1111", email: "frank@shield.com", status: "Closed" },
  { id: "l5", name: "Grace Hopper", organization: "Naval Intelligence", phone: "(555) 222-3333", email: "grace@navy.mil", status: "New" },
  { id: "l6", name: "Hank Pym", organization: "Pym Technologies", phone: "(555) 666-7777", email: "hank@pym.com", status: "Pending" },
  { id: "l7", name: "Iris West", organization: "Central City", phone: "(555) 888-9999", email: "iwest@central.com", status: "Active" },
];

const Leads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Leads");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeadItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LeadItem | null>(null);
  const [allData, setAllData] = useLocalStorage<LeadItem[]>("leads", defaultData);

  const filters = ["All Leads", "New", "Active", "Closed"];

  const filteredData = allData.filter((row) => {
    const matchesFilter = activeFilter === "All Leads" || row.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.organization.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q);
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
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const item = allData.find((d) => d.id === row.id);
    if (item) {
      setEditingItem(item);
      setModalOpen(true);
    }
  };

  const handleSave = (data: { name: string; organization: string; phone: string; email: string }) => {
    if (editingItem) {
      setAllData((prev) =>
        prev.map((d) =>
          d.id === editingItem.id ? { ...d, ...data } : d
        )
      );
    } else {
      setAllData((prev) => [
        ...prev,
        { id: String(Date.now()), ...data, status: "New" },
      ]);
    }
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

  const subHeader = (
    <div className="flex items-center gap-2 px-5 py-2.5">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => handleFilterClick(f)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === f
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Sources</option>
          <option>Website</option>
          <option>Referral</option>
        </select>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between px-5 py-2.5 text-sm">
      <p className="text-gray-400">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} leads
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
  );

  const rightPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lead Metrics</h3>
        <div className="space-y-2">
          {leadStats.map(({ label, value, trend, change }) => (
            <div key={label} className="flex items-center justify-between px-3 py-3 rounded-lg bg-gray-800">
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-blue-400" : "text-gray-400"}`}>
                {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      subHeader={subHeader}
      footer={footer}
      rightPanel={rightPanelContent}
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      onAddNew={openAdd}
    >
      <div className="p-5">
        <div className="bg-white border border-gray-200">
          <Table columns={columns} data={paginatedData} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>
      {modalOpen && (
        <Modal
          initialData={editingItem ?? undefined}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {deletingItem && (
        <ConfirmDialog
          title="Delete Lead"
          message={`Are you sure you want to delete "${deletingItem.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </Layout>
  );
};

export default Leads;
