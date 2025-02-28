// src/pages/Empleados/EmpleadosTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
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
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (openMenuId !== null && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 150;
      const windowHeight = window.innerHeight;
      if (windowHeight - buttonRect.bottom > menuHeight) {
        setMenuPosition("bottom");
      } else {
        setMenuPosition("top");
      }
    }
  }, [openMenuId]);

  const getContactNumbers = (emp: Empleado) => {
    const contacts: string[] = [];
    if (emp.celular) contacts.push(emp.celular);
    if (emp.telefono1) contacts.push(emp.telefono1);
    if (emp.telefono2) contacts.push(emp.telefono2);
    if (emp.whatsapp) contacts.push(`WhatsApp: ${emp.whatsapp}`);
    return contacts.length ? contacts.join(" | ") : "N/A";
  };

  return (
    <div className="table-container p-4">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="table-header">
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
            <tr key={emp.id} className="table-row">
              <td className="p-3 relative">
                <button
                  ref={buttonRef}
                  onClick={() =>
                    setOpenMenuId(openMenuId === emp.id ? null : emp.id)
                  }
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
                {openMenuId === emp.id && (
                  <div
                    ref={menuRef}
                    className={`absolute left-0 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50 p-2 ${
                      menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                  >
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(emp.id);
                      }}
                    >
                      <FaEdit className="text-blue-500 w-4 h-4" />
                      <span className="text-gray-800">Editar</span>
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(emp.id);
                      }}
                    >
                      <FaTrash className="text-red-500 w-4 h-4" />
                      <span className="text-gray-800">Eliminar</span>
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onViewDetails(emp.id);
                      }}
                    >
                      <FaInfoCircle className="text-gray-500 w-4 h-4" />
                      <span className="text-gray-800">Ver detalles</span>
                    </button>
                  </div>
                )}
              </td>
              <td className="p-3 text-center">
                <div className="font-bold">{emp.nombre_razon_social}</div>
                {emp.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {emp.tipo_documento.abreviatura} {emp.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {emp.numero_documento}
                  </div>
                )}
              </td>
              <td className="p-3">{getContactNumbers(emp)}</td>
              <td className="p-3">
                {emp.departamento && (
                  <div className="text-sm text-gray-500">
                    {emp.departamento.nombre}
                  </div>
                )}
                {emp.ciudad && (
                  <div className="text-sm text-gray-500">
                    {emp.ciudad.nombre}
                  </div>
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
    </div>
  );
};

export default EmpleadosTable;
