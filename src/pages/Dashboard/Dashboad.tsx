import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Target, Mail, Activity } from "lucide-react";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";
import ContactFormModal from "../../components/common/ContactFormModal";
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

const defaultPersons: Person[] = [];

const itemsPerPage = 10;

const Dashboad = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Person | null>(null);
  const [deletingItem, setDeletingItem] = useState<Person | null>(null);
  const [allData, setAllData] = useLocalStorage<Person[]>("contacts_persons", defaultPersons);

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
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(q) ||
      row.organization.toLowerCase().includes(q) ||
      row.emails[0]?.address.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const dashboardRows = paginatedData.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    organization: p.organization,
    phone: p.phones[0]?.number ?? "-",
    email: p.emails[0]?.address ?? "-",
    status: p.status,
  }));

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

  const handleSave = (data: { firstName: string; lastName: string; organization: string; phones: { id: string; number: string; type: "work" | "personal" }[]; emails: { id: string; address: string; type: "work" | "personal" }[]; label: string; owner: string; visibleTo: "everyone" | "only_me" | "team"; status: string }) => {
    if (editingItem) {
      setAllData((prev) =>
        prev.map((d) =>
          d.id === editingItem.id ? { ...d, ...data } : d
        )
      );
    } else {
      setAllData((prev) => [
        ...prev,
        { id: String(Date.now()), ...data },
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
      {["All", "Active", "Pending", "Inactive", "New", "Closed"].map((f) => (
        <button
          key={f}
          onClick={() => handleFilter(f)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === f
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {f}
        </button>
      ))}
      <div className="ml-auto">
        <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Table columns={columns} data={dashboardRows} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>
      {modalOpen && (
        <ContactFormModal
          initialData={editingItem ?? undefined}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {deletingItem && (
        <ConfirmDialog
          title="Delete Contact"
          message={`Are you sure you want to delete "${deletingItem.firstName} ${deletingItem.lastName}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </Layout>
  );
};

export default Dashboad;
