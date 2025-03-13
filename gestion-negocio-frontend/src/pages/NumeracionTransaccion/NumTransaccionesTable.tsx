// src/pages/NumeracionTransaccion/NumTransaccionesTable.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal";
import { NumTransaccion } from "./numeracionTransaccionTypes";

interface NumTransaccionesTableProps {
  numeraciones: NumTransaccion[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const NumTransaccionesTable: React.FC<NumTransaccionesTableProps> = ({
  numeraciones,
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
    numId: number
  ) {
    if (openMenuId === numId) {
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
    setOpenMenuId(numId);
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
            <th className="p-3">Nombre Personalizado</th>
            <th className="p-3">Título</th>
            <th className="p-3">Prefijo</th>
            <th className="p-3">Siguiente</th>
            <th className="p-3">Por Defecto</th>
          </tr>
        </thead>
        <tbody>
          {numeraciones.map((num) => (
            <tr key={num.id} className="hover:bg-gray-50">
              {/* Acciones (menú) */}
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, num.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>

              <td className="p-3 font-bold">{num.nombre_personalizado}</td>
              <td className="p-3">{num.titulo_transaccion}</td>
              <td className="p-3">{num.prefijo || "N/A"}</td>
              <td className="p-3">{num.numeracion_siguiente}</td>
              <td className="p-3">
                {num.numeracion_por_defecto ? "Sí" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Menú flotante */}
      {openMenuId && (
        <Portal>
          <div
            ref={menuRef}
            className="absolute w-48 bg-white border border-gray-200 shadow-md rounded z-50"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {/* Editar */}
            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
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
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
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
              className="flex items-center gap-2 px-4 py-2 w-full text-left
                         hover:bg-gray-100 text-gray-800"
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

export default NumTransaccionesTable;
