// src/pages/Empleados/EmpleadosTable.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal";
import { Empleado } from "./empleadosTypes";

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
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

  function handleMenuButtonClick(e: React.MouseEvent<HTMLButtonElement>, empId: number) {
    if (openMenuId === empId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // espacio abajo
      top = rect.bottom + window.scrollY;
    } else {
      // abrir hacia arriba
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(empId);
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

  function getContactNumbers(emp: Empleado) {
    const contacts: string[] = [];
    if (emp.celular) contacts.push(emp.celular);
    if (emp.telefono1) contacts.push(emp.telefono1);
    if (emp.telefono2) contacts.push(emp.telefono2);
    if (emp.whatsapp) contacts.push(`WhatsApp: ${emp.whatsapp}`);
    return contacts.length ? contacts.join(" | ") : "N/A";
  }

  return (
    <div className="table-container p-4 relative overflow-x-auto">
      <table className="w-full border-collapse text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Acciones</th>
            <th className="p-3">Empleado</th>
            <th className="p-3">Teléfonos</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Activo</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, emp.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3">
                <div className="font-bold">{emp.nombre_razon_social}</div>
                {emp.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {emp.tipo_documento.abreviatura} {emp.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{emp.numero_documento}</div>
                )}
              </td>
              <td className="p-3">{getContactNumbers(emp)}</td>
              <td className="p-3">
                {emp.departamento && (
                  <div className="text-sm text-gray-500">{emp.departamento.nombre}</div>
                )}
                {emp.ciudad && (
                  <div className="text-sm text-gray-500">{emp.ciudad.nombre}</div>
                )}
                <div className="font-semibold">{emp.direccion}</div>
              </td>
              <td className="p-3">{emp.email || "N/A"}</td>
              <td className="p-3">
                {emp.activo ? (
                  <span className="text-green-600 font-bold">Activo</span>
                ) : (
                  <span className="text-red-500 font-bold">Inactivo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openMenuId && (
        <Portal>
          <div
            ref={menuRef}
            className="absolute w-48 bg-white border border-gray-300
                       shadow-md rounded z-50"
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
              Editar
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
              Eliminar
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
              Ver detalles
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default EmpleadosTable;
