import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Table from "../../components/common/Table";

const contactsData = [
  { name: "John Smith", organization: "Acme Corp", phone: "(555) 123-4567", email: "john.smith@acme.com", status: "Active" },
  { name: "Sarah Johnson", organization: "Globex Inc", phone: "(555) 987-6543", email: "sarah.j@globex.com", status: "New" },
  { name: "Michael Brown", organization: "Initech", phone: "(555) 456-7890", email: "mbrown@initech.co", status: "Active" },
  { name: "Emily Davis", organization: "Hooli", phone: "(555) 234-5678", email: "emily.d@hooli.com", status: "Pending" },
  { name: "James Wilson", organization: "Stark Industries", phone: "(555) 876-5432", email: "jwilson@stark.com", status: "Active" },
  { name: "Lisa Anderson", organization: "Wayne Enterprises", phone: "(555) 345-6789", email: "l.anderson@wayne.com", status: "Inactive" },
  { name: "David Taylor", organization: "Umbrella Corp", phone: "(555) 654-3210", email: "dtaylor@umbrella.com", status: "New" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "organization", label: "Organization" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const Dashboad = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Layout title="Contacts">
      <div className="bg-white rounded-xl border border-gray-200">
        <Table columns={columns} data={contactsData} />
      </div>
    </Layout>
  );
};

export default Dashboad;
