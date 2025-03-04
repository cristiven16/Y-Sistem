// src/pages/Clientes/ClientesTable.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal"; // Ajusta ruta a tu Portal.tsx

interface TipoDocumento {
  id: number;
  nombre: string;
  abreviatura: string;
}
interface Departamento {
  id: number;
  nombre: string;
}
interface Ciudad {
  id: number;
  nombre: string;
}
interface Cliente {
  id: number;
  nombre_razon_social: string;
  numero_documento: string;
  tipo_documento?: TipoDocumento;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  departamento?: Departamento;
  ciudad?: Ciudad;
  direccion: string;
  email: string;
  cxc?: number;
}

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const ClientesTable: React.FC<ClientesTableProps> = ({
  clientes,
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

  function handleMenuButtonClick(e: React.MouseEvent<HTMLButtonElement>, clienteId: number) {
    if (openMenuId === clienteId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150; // Aproximado
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // Hay espacio abajo
      top = rect.bottom + window.scrollY;
    } else {
      // Abrir hacia arriba
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(clienteId);
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (!openMenuId) return;
      if (menuRef.current?.contains(ev.target as Node)) return;
      closeMenu();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  function getAllContactNumbers(cliente: Cliente) {
    const contacts: string[] = [];
    if (cliente.celular) contacts.push(cliente.celular);
    if (cliente.telefono1) contacts.push(cliente.telefono1);
    if (cliente.telefono2) contacts.push(cliente.telefono2);
    if (cliente.whatsapp) contacts.push(`WhatsApp: ${cliente.whatsapp}`);
    return contacts.length ? contacts.join(" | ") : "N/A";
  }

  return (
    <div className="table-container p-4 relative overflow-x-auto">
      <table className="w-full border-collapse text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Acciones</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Teléfonos</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Email</th>
            <th className="p-3">CXC</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, cliente.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3">
                <div className="font-bold">{cliente.nombre_razon_social}</div>
                {cliente.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {cliente.tipo_documento.abreviatura} {cliente.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{cliente.numero_documento}</div>
                )}
              </td>
              <td className="p-3">{getAllContactNumbers(cliente)}</td>
              <td className="p-3">
                {cliente.ciudad && (
                  <div className="text-sm text-gray-500">{cliente.ciudad.nombre}</div>
                )}
                <div className="font-semibold">{cliente.direccion}</div>
              </td>
              <td className="p-3">{cliente.email}</td>
              <td className="p-3 font-bold text-green-600">
                ${cliente.cxc?.toLocaleString() || "0"}
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
              <span>Ver detalles</span>
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ClientesTable;
