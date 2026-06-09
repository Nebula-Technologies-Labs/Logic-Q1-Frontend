import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

const DATA_CLEAR_FLAG = "data_cleared_v3";

if (!localStorage.getItem(DATA_CLEAR_FLAG)) {
  const keys = [
    "token", "contacts_persons", "contacts_orgs", "contacts_timeline",
    "dashboard_tasks", "pipeline_deals", "pipeline_activity",
    "communication_messages", "user_info",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
  localStorage.setItem(DATA_CLEAR_FLAG, "true");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
