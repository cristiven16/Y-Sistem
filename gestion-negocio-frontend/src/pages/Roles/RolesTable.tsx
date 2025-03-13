// src/pages/Roles/RolesTable.tsx

import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal"; // Ajusta si tu Portal está en otro lugar
import { Role } from "./rolesTypes";

interface RolesTableProps {
  roles: Role[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeMenu() {
    setOpenMenuId(null);
  }

  function handleMenuButtonClick(
    e: React.MouseEvent<HTMLButtonElement>,
    roleId: number
  ) {
    if (openMenuId === roleId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // abrir abajo
      top = rect.bottom + window.scrollY;
    } else {
      // abrir arriba
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(roleId);
  }

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (!openMenuId) return;
      if (menuRef.current?.contains(ev.target as Node)) return;
      closeMenu();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="table-container p-4 relative overflow-x-auto">
      <table className="w-full border-collapse text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Acciones</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Organización</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, role.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3 font-bold">{role.nombre}</td>
              <td className="p-3">{role.descripcion || "N/A"}</td>
              <td className="p-3">{role.organizacion_id ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {openMenuId && (
        <Portal>
          <div
            ref={menuRef}
            className="absolute w-48 bg-white border border-gray-200 shadow-md rounded z-50"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onEdit(openMenuId!);
              }}
            >
              <FaEdit className="text-blue-500 w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onDelete(openMenuId!);
              }}
            >
              <FaTrash className="text-red-500 w-4 h-4" />
              <span>Eliminar</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onViewDetails(openMenuId!);
              }}
            >
              <FaInfoCircle className="text-gray-500 w-4 h-4" />
              <span>Detalles</span>
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default RolesTable;
