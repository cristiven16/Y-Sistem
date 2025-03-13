// src/pages/TiendasVirtuales/TiendasVirtualesTable.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal";
import { TiendaVirtual } from "./tiendasvirtualesTypes";

interface TiendasVirtualesTableProps {
  tiendas: TiendaVirtual[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const TiendasVirtualesTable: React.FC<TiendasVirtualesTableProps> = ({
  tiendas,
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
    tiendaId: number
  ) {
    if (openMenuId === tiendaId) {
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
    setOpenMenuId(tiendaId);
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
            <th className="p-3">Plataforma</th>
            <th className="p-3">URL</th>
            <th className="p-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {tiendas.map((tienda) => (
            <tr key={tienda.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, tienda.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3 font-bold">{tienda.nombre}</td>
              <td className="p-3">{tienda.plataforma || "N/A"}</td>
              <td className="p-3">{tienda.url || "N/A"}</td>
              <td className="p-3">
                {tienda.estado ? "Activa" : "Inactiva"}
              </td>
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
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onEdit(openMenuId);
              }}
            >
              <FaEdit className="text-blue-500 w-4 h-4" />
              <span>Editar</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onDelete(openMenuId);
              }}
            >
              <FaTrash className="text-red-500 w-4 h-4" />
              <span>Eliminar</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
              onClick={() => {
                closeMenu();
                onViewDetails(openMenuId);
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

export default TiendasVirtualesTable;
