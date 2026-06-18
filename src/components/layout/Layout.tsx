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
  onAddNew?: () => void;
}

const Layout = ({ children, rightPanel, subHeader, footer, searchValue, onSearch, onAddNew }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={onSearch}
          onAddNew={onAddNew}
          searchValue={searchValue}
        />
        {subHeader && (
          <div className="border-b border-outline-variant bg-surface-container-lowest">
            {subHeader}
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          {rightPanel && (
            <aside className="hidden lg:block w-96 bg-surface-container-lowest border-l border-outline-variant overflow-y-auto p-6">
              {rightPanel}
            </aside>
          )}
        </div>
        {footer && (
          <div className="bg-surface-container-lowest border-t border-outline-variant">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
