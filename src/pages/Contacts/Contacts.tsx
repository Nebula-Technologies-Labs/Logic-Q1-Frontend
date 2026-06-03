import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";

const contactsData = [
  { name: "Alice Cooper", organization: "Cyberdyne", phone: "(555) 111-2222", email: "alice@cyberdyne.com", status: "Active" },
  { name: "Bob Marley", organization: "Massive Dynamic", phone: "(555) 333-4444", email: "bob@massive.com", status: "New" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "organization", label: "Organization" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const Contacts = () => {
  return (
    <Layout title="Contacts">
      <div className="bg-white rounded-xl border border-gray-200">
        <Table columns={columns} data={contactsData} />
      </div>
    </Layout>
  );
};

export default Contacts;
