// src/pages/Usuarios/UsuariosTable.tsx

import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal";
import { Usuario } from "./usuariosTypes";

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
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
    userId: number
  ) {
    if (openMenuId === userId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      top = rect.bottom + window.scrollY;
    } else {
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(userId);
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
            <th className="p-3">Email</th>
            <th className="p-3">Rol</th>
            {/* Muestra la org si lo deseas */}
            {/* <th className="p-3">Organización</th> */}
            <th className="p-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, u.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3 font-bold">{u.nombre}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                {u.rol_id ?? "N/A"}
                {/* Si tu backend retorna un "rol_nombre", podrías mostrarlo en vez del ID */}
              </td>
              <td className="p-3">{u.estado}</td>
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

export default UsuariosTable;
