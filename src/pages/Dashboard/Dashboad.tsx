import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Target, Mail, Activity } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useLocalStorage } from "../../utils/storage";

interface DashItem extends Record<string, unknown> {
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

const stats = [
  { label: "Total Contacts", value: "2,847", icon: Users },
  { label: "Active Leads", value: "143", icon: Target },
  { label: "Avg Response", value: "2.4h", icon: Activity },
  { label: "Unread", value: "24", icon: Mail },
];

const recentActivity = [
  { user: "Sarah Johnson", action: "added as lead", time: "2m ago" },
  { user: "Michael Brown", action: "updated contact", time: "15m ago" },
  { user: "Emily Davis", action: "converted to client", time: "1h ago" },
  { user: "James Wilson", action: "sent a message", time: "2h ago" },
  { user: "Lisa Anderson", action: "updated profile", time: "4h ago" },
  { user: "Robert Williams", action: "added note", time: "5h ago" },
];

const defaultData: DashItem[] = [
  { id: "d1", name: "John Smith", organization: "Acme Corp", phone: "(555) 123-4567", email: "john.smith@acme.com", status: "Active" },
  { id: "d2", name: "Sarah Johnson", organization: "Globex Inc", phone: "(555) 987-6543", email: "sarah.j@globex.com", status: "New" },
  { id: "d3", name: "Michael Brown", organization: "Initech", phone: "(555) 456-7890", email: "mbrown@initech.co", status: "Active" },
  { id: "d4", name: "Emily Davis", organization: "Hooli", phone: "(555) 234-5678", email: "emily.d@hooli.com", status: "Pending" },
  { id: "d5", name: "James Wilson", organization: "Stark Industries", phone: "(555) 876-5432", email: "jwilson@stark.com", status: "Active" },
  { id: "d6", name: "Lisa Anderson", organization: "Wayne Enterprises", phone: "(555) 345-6789", email: "l.anderson@wayne.com", status: "Inactive" },
  { id: "d7", name: "David Taylor", organization: "Umbrella Corp", phone: "(555) 654-3210", email: "dtaylor@umbrella.com", status: "New" },
  { id: "d8", name: "Robert Williams", organization: "Cyberdyne", phone: "(555) 111-2222", email: "rwilliams@cyberdyne.com", status: "Active" },
  { id: "d9", name: "Jennifer Lee", organization: "Massive Dynamic", phone: "(555) 333-4444", email: "jlee@massive.com", status: "Pending" },
  { id: "d10", name: "Thomas Clark", organization: "LexCorp", phone: "(555) 555-6666", email: "tclark@lexcorp.com", status: "Active" },
  { id: "d11", name: "Maria Garcia", organization: "Oscorp", phone: "(555) 777-8888", email: "mgarcia@oscorp.com", status: "Active" },
  { id: "d12", name: "Kevin Brown", organization: "Wayne Corp", phone: "(555) 999-0000", email: "kbrown@wayne.com", status: "Pending" },
];

const itemsPerPage = 10;

const Dashboad = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DashItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DashItem | null>(null);
  const [allData, setAllData] = useLocalStorage<DashItem[]>("dash_contacts", defaultData);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const filteredData = allData.filter((row) => {
    const matchesFilter = activeFilter === "All" || row.status === activeFilter;
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

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
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
      {["All", "Active", "Pending", "Inactive", "New"].map((f) => (
        <button
          key={f}
          onClick={() => handleFilter(f)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === f
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto">
        <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Today</option>
        </select>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between px-5 py-2.5 text-sm">
      <p className="text-gray-400">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} contacts
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
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Stats</h3>
        <div className="space-y-2">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <Icon size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map(({ user, action, time }) => (
            <div key={user + time} className="text-sm">
              <p className="text-gray-300">
                <span className="font-medium text-white">{user}</span>{" "}
                <span className="text-gray-400">{action}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{time}</p>
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
          title="Delete Contact"
          message={`Are you sure you want to delete "${deletingItem.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboad;
