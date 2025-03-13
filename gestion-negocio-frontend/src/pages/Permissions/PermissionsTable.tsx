// src/pages/Permissions/PermissionsTable.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal"; // Ajusta ruta a tu Portal
import { Permission } from "./permissionsTypes";

interface PermissionsTableProps {
  permissions: Permission[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
  permissions,
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
    permId: number
  ) {
    if (openMenuId === permId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      top = rect.bottom + window.scrollY; // abrir abajo
    } else {
      top = rect.top + window.scrollY - menuHeight; // abrir arriba
    }

    setMenuPos({ top, left });
    setOpenMenuId(permId);
  }

  // Cerrar menú al hacer clic fuera
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
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.id} className="hover:bg-gray-50">
              {/* Acciones */}
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, perm.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>

              <td className="p-3 font-bold">{perm.nombre}</td>
              <td className="p-3">{perm.descripcion || "N/A"}</td>
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
            {/* Editar */}
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
            {/* Eliminar */}
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
            {/* Detalles */}
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

export default PermissionsTable;
