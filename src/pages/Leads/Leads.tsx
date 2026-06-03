import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";

const leadsData = [
  { name: "Carol White", organization: "Oscorp", phone: "(555) 555-6666", email: "carol@oscorp.com", status: "New" },
  { name: "Dan Green", organization: "LexCorp", phone: "(555) 777-8888", email: "dan@lexcorp.com", status: "Pending" },
  { name: "Eve Black", organization: "SPECTRE", phone: "(555) 999-0000", email: "eve@spectre.com", status: "Active" },
  { name: "Frank Castle", organization: "S.H.I.E.L.D.", phone: "(555) 444-1111", email: "frank@shield.com", status: "Closed" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "organization", label: "Organization" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const Leads = () => {
  return (
    <Layout title="Leads">
      <div className="bg-white rounded-xl border border-gray-200">
        <Table columns={columns} data={leadsData} />
      </div>
    </Layout>
  );
};

export default Leads;
