// src/pages/Sucursales/SucursalesTable.tsx
import React, { useEffect, useRef, useState, MouseEvent } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal"; // Ajusta la ruta si difiere
import { Sucursal } from "./sucursalesTypes";

interface SucursalesTableProps {
  sucursales: Sucursal[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void; // si tienes modal de detalles
}

const SucursalesTable: React.FC<SucursalesTableProps> = ({
  sucursales,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  // ID de la sucursal cuyo menú está abierto
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Posición del menú flotante
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Referencia al contenedor del menú, para cerrar si clic fuera
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar menú
  function closeMenu() {
    setOpenMenuId(null);
  }

  // Al hacer clic en el botón 3 puntitos
  function handleMenuButtonClick(e: MouseEvent<HTMLButtonElement>, sucId: number) {
    // Si ya está abierto en la misma sucursal => ciérralo
    if (openMenuId === sucId) {
      closeMenu();
      return;
    }

    // Calculamos la posición donde se abrirá el menú
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150; // Aproximado
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // Abrir debajo del botón
      top = rect.bottom + window.scrollY;
    } else {
      // Abrir arriba del botón
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(sucId);
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (!openMenuId) return; // no hay menú abierto
      // si se hace clic dentro del menú, no cerrar
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
            <th className="p-3">Sucursal</th>
            <th className="p-3">Teléfonos</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Principal</th>
            <th className="p-3">Activa</th>
          </tr>
        </thead>
        <tbody>
          {sucursales.map((suc) => (
            <tr key={suc.id} className="hover:bg-gray-50">
              {/* ACCIONES */}
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, suc.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>

              {/* NOMBRE */}
              <td className="p-3 font-bold">{suc.nombre}</td>

              {/* TELÉFONOS */}
              <td className="p-3">{suc.telefonos || "N/A"}</td>

              {/* DIRECCIÓN */}
              <td className="p-3">{suc.direccion || "N/A"}</td>

              {/* PRINCIPAL */}
              <td className="p-3">{suc.sucursal_principal ? "Sí" : "No"}</td>

              {/* ACTIVA */}
              <td className="p-3">{suc.activa ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Menú flotante */}
      {openMenuId && (
        <Portal>
          <div
            ref={menuRef}
            className="absolute w-48 bg-white border border-gray-200 shadow-md
                       rounded z-50"
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

export default SucursalesTable;
