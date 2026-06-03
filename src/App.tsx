import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboad from "./pages/Dashboard/Dashboad";
import Contacts from "./pages/Contacts/Contacts";
import Leads from "./pages/Leads/Leads";
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
      <Route path="/leads" element={<Leads />} />
    </Routes>
  );
};

export default App;
