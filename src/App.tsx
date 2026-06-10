import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboad from "./pages/Dashboard/Dashboad";
import Contacts from "./pages/Contacts/Contacts";
import ContactDetail from "./pages/ContactDetail/ContactDetail";
import Organizations from "./pages/Organizations/Organizations";
import Leads from "./pages/Leads/Leads";
import Pipeline from "./pages/Pipeline/Pipeline";
import Activity from "./pages/Activity/Activity";
import Tasks from "./pages/Tasks/Tasks";
import Communication from "./pages/Communication/Communication";
import RedirectHandler from "./pages/redirect/RedirectHandler";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/oauth2/redirect" element={<RedirectHandler />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Dashboad />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/contacts/:id" element={<ContactDetail />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/communication" element={<Communication />} />
    </Routes>
  );
};

export default App;
