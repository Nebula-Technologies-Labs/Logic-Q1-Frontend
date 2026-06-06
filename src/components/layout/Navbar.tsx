import { Search, Plus, Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
  onSearch: (value: string) => void;
  onAddNew: () => void;
  searchValue: string;
}

const Navbar = ({ onMenuClick, onSearch, onAddNew, searchValue }: NavbarProps) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-bold text-lg">Logic</span>
          <span className="text-blue-600 font-bold text-lg">Q1</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search anything..."
            className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 lg:w-56 transition-colors"
          />
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
