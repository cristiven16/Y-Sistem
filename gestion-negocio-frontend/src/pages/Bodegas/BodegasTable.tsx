// src/pages/Bodegas/BodegasTable.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal"; // Ajusta la ruta si tu Portal está en otro lugar
import { Bodega } from "./bodegasTypes";

interface BodegasTableProps {
  bodegas: Bodega[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const BodegasTable: React.FC<BodegasTableProps> = ({
  bodegas,
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
    bodegaId: number
  ) {
    if (openMenuId === bodegaId) {
      closeMenu();
      return;
    }
    // Calculamos posición para el menú (similar a la lógica en Sucursales)
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // Mostrar menú debajo del botón
      top = rect.bottom + window.scrollY;
    } else {
      // Mostrar menú encima del botón
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(bodegaId);
  }

  // Cerrar menú al hacer clic fuera de él
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
            <th className="p-3">Bodega</th>
            <th className="p-3">Sucursal</th>
            <th className="p-3">Bodega Por Defecto</th>
            <th className="p-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {bodegas.map((bodega) => (
            <tr key={bodega.id} className="hover:bg-gray-50">
              {/* Acciones: menú de 3 puntitos */}
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, bodega.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>

              {/* Nombre de la Bodega */}
              <td className="p-3 font-bold">{bodega.nombre}</td>

              {/* Nombre de la Sucursal (o ID si no viene la relación) */}
              <td className="p-3">
                {bodega.sucursal?.nombre
                  ? bodega.sucursal.nombre
                  : `#${bodega.sucursal_id}`}
              </td>

              {/* Indicar si es Bodega por Defecto */}
              <td className="p-3">
                {bodega.bodega_por_defecto ? "Sí" : "No"}
              </td>

              {/* Estado (Activa/Inactiva) */}
              <td className="p-3">
                {bodega.estado ? "Activa" : "Inactiva"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Menú flotante en Portal */}
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
                onEdit(openMenuId);
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
                onDelete(openMenuId);
              }}
            >
              <FaTrash className="text-red-500 w-4 h-4" />
              <span>Eliminar</span>
            </button>
            {/* Ver detalles */}
            <button
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-800"
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

export default BodegasTable;
