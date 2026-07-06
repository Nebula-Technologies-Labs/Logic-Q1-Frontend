import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

import "./RootLayout.css";

const RootLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="root-layout">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            <div className="layout-main">
                <TopBar />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default RootLayout;
