// src/components/Sidebar.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  Users,
  Briefcase,
  User,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROLE_SUPERADMIN, ROLE_ADMIN } from "../utils/roles";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const [tercerosOpen, setTercerosOpen] = useState(false);
  const [superOpen, setSuperOpen] = useState(false);

  const { user, logout } = useAuth();

  // Si no hay user => no mostrar el sidebar
  if (!user) {
    return null;
  }

  // Suponiendo que en `user` tienes la propiedad "organizacion_id"
  const orgId = user.organizacion_id;

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
      {/* Botón para togglear la sidebar completa */}
      <button
        className="mb-4 flex items-center justify-center w-full p-2 bg-gray-800 rounded 
                   hover:bg-gray-700 focus:ring focus:ring-blue-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Botón para cerrar sesión */}
      <button
        onClick={logout}
        className="mb-4 flex items-center justify-center w-full p-2 bg-red-600 hover:bg-red-700 rounded"
      >
        {isOpen ? "Cerrar sesión" : <User size={20} />}
      </button>

      <nav className="space-y-2 flex-1 overflow-auto">
        {/* ─────────────────────────────────────────────
            Módulo de Administración
            Aparece si user.rol_id <= ROLE_ADMIN
           ───────────────────────────────────────────── */}
        {user.rol_id <= ROLE_ADMIN && (
          <>
            <button
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded w-full text-left"
              onClick={() => {
                setAdminOpen(!adminOpen);
                // Cerrar los otros submenús
                setTercerosOpen(false);
                setSuperOpen(false);
              }}
            >
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  adminOpen ? "rotate-180" : "rotate-0"
                }`}
              />
              {isOpen && (
                <>
                  <Settings size={20} />
                  <span>Administración</span>
                </>
              )}
            </button>

            {adminOpen && isOpen && (
              <ul className="pl-4 space-y-1 bg-gray-800 p-2 rounded-lg shadow-lg">
                {/* Ajustes de la Empresa => link dinámico con orgId */}
                <li>
                  <Link
                    to={`/organizations/${orgId}/ajustes`}
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Ajustes de la Empresa
                  </Link>
                </li>

                <li>
                  <Link
                    to="/sucursales"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Sucursales
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bodegas"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Bodegas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cajas"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Cajas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/users"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Usuarios
                  </Link>
                </li>
                <li>
                  <Link
                    to="/roles"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Roles
                  </Link>
                </li>
              </ul>
            )}
          </>
        )}

        {/* ─────────────────────────────────────────────
            Módulo de Terceros (siempre visible, con submenú)
           ───────────────────────────────────────────── */}
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded w-full text-left"
          onClick={() => {
            setTercerosOpen(!tercerosOpen);
            setAdminOpen(false);
            setSuperOpen(false);
          }}
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${
              tercerosOpen ? "rotate-180" : "rotate-0"
            }`}
          />
          {isOpen && (
            <>
              <Users size={20} />
              <span>Terceros</span>
            </>
          )}
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

        {/* ─────────────────────────────────────────────
            Módulo SuperAdmin (rol <= ROLE_SUPERADMIN)
           ───────────────────────────────────────────── */}
        {user.rol_id <= ROLE_SUPERADMIN && (
          <>
            <button
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded w-full text-left"
              onClick={() => {
                setSuperOpen(!superOpen);
                setAdminOpen(false);
                setTercerosOpen(false);
              }}
            >
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  superOpen ? "rotate-180" : "rotate-0"
                }`}
              />
              {isOpen && (
                <>
                  <ShieldAlert size={20} />
                  <span>SuperAdmin</span>
                </>
              )}
            </button>

            {superOpen && isOpen && (
              <ul className="pl-4 space-y-1 bg-gray-800 p-2 rounded-lg shadow-lg">
                <li>
                  <Link
                    to="/plans"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Planes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orgs"
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 text-white rounded transition"
                  >
                    Admin. Organizaciones
                  </Link>
                </li>
              </ul>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
