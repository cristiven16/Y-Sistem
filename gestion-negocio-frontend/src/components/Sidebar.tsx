// src/components/Sidebar.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, Users, Briefcase, User } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [tercerosOpen, setTercerosOpen] = useState(false);

  return (
    <div
      className={`
        h-screen bg-gray-900 text-white
        ${isOpen ? "w-64" : "w-16"}
        transition-all duration-300
        fixed left-0 top-0 p-2 shadow-lg flex flex-col
        z-50
      `}
    >
      <button
        className="mb-4 flex items-center justify-center w-full p-2 bg-gray-800 rounded 
                   hover:bg-gray-700 focus:ring focus:ring-blue-300"
        onClick={() => setIsOpen(!isOpen)} // Toggle state
      >
        <Menu size={24} />
      </button>

      <nav className="space-y-2 flex-1 overflow-auto">
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded w-full text-left"
          onClick={() => setTercerosOpen(!tercerosOpen)}
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${
              tercerosOpen ? "rotate-180" : "rotate-0"
            }`}
          />
          {isOpen && "Terceros"}
        </button>

        {tercerosOpen && isOpen && (
          <ul className="pl-4 space-y-1 bg-gray-800 p-2 rounded-lg shadow-lg">
            <li>
              <Link
                to="/clientes"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
              >
                <Users size={20} />
                Clientes
              </Link>
            </li>
            <li>
              <Link
                to="/proveedores"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
              >
                <Briefcase size={20} />
                Proveedores
              </Link>
            </li>
            <li>
              <Link
                to="/empleados"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
              >
                <User size={20} />
                Empleados
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
