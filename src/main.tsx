import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ErrorBoundary from "@/components/ErrorBoundary";
import App from "@/app/App";
import AppProviders from "@/app/providers";
import "@/index.css";

createRoot(
    document.getElementById("root")!
).render(
    <StrictMode>
        <ErrorBoundary>
            <AppProviders>
                <App />
            </AppProviders>
        </ErrorBoundary>
    </StrictMode>
);