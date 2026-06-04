import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  subHeader?: React.ReactNode;
  footer?: React.ReactNode;
  searchValue: string;
  onSearch: (value: string) => void;
  onAddNew: () => void;
}

const Layout = ({ children, rightPanel, subHeader, footer, searchValue, onSearch, onAddNew }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={onSearch}
          onAddNew={onAddNew}
          searchValue={searchValue}
        />
        {subHeader && (
          <div className="border-b border-gray-200 border-gray-700 bg-white bg-gray-800">
            {subHeader}
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          {rightPanel && (
            <aside className="hidden lg:block w-96 bg-gray-900 border-l border-gray-700 overflow-y-auto p-5">
              {rightPanel}
            </aside>
          )}
        </div>
        {footer && (
          <div className="bg-gray-900 border-t border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
