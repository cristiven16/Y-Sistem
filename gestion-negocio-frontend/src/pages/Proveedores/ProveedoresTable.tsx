// src/pages/Proveedores/ProveedoresTable.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Portal from "../../utils/Portal";
import { ProveedorResponse } from "./proveedoresTypes";


interface ProveedoresTableProps {
  proveedores: ProveedorResponse[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const ProveedoresTable: React.FC<ProveedoresTableProps> = ({
  proveedores,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | undefined>(undefined);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeMenu() {
    setOpenMenuId(undefined);
  }

  function handleMenuButtonClick(
    e: React.MouseEvent<HTMLButtonElement>,
    provId: number
  ) {
    if (openMenuId === provId) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 150;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top = 0;
    let left = rect.left + window.scrollX;

    if (spaceBelow >= menuHeight) {
      // hacia abajo
      top = rect.bottom + window.scrollY;
    } else {
      // hacia arriba
      top = rect.top + window.scrollY - menuHeight;
    }

    setMenuPos({ top, left });
    setOpenMenuId(provId);
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

  function getAllContactNumbers(prov: ProveedorResponse) {
    const contacts: string[] = [];
    if (prov.celular) contacts.push(prov.celular);
    if (prov.telefono1) contacts.push(prov.telefono1);
    if (prov.telefono2) contacts.push(prov.telefono2);
    if (prov.whatsapp) contacts.push(`WhatsApp: ${prov.whatsapp}`);
    return contacts.length ? contacts.join(" | ") : "N/A";
  }

  return (
    <div className="table-container p-4 relative overflow-x-auto">
      <table className="w-full border-collapse text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">Acciones</th>
            <th className="p-3">Proveedor</th>
            <th className="p-3">Teléfonos</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Email</th>
            <th className="p-3">CXC</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((prov) => (
            <tr key={prov.id} className="hover:bg-gray-50">
              <td className="p-3">
                <button
                  onClick={(e) => handleMenuButtonClick(e, prov.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
              </td>
              <td className="p-3">
                <div className="font-bold">{prov.nombre_razon_social}</div>
                {prov.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {prov.tipo_documento.abreviatura} {prov.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{prov.numero_documento}</div>
                )}
              </td>
              <td className="p-3">{getAllContactNumbers(prov)}</td>
              <td className="p-3">
                {prov.ciudad && (
                  <div className="text-sm text-gray-500">{prov.ciudad.nombre}</div>
                )}
                <div className="font-semibold">{prov.direccion}</div>
              </td>
              <td className="p-3">{prov.email}</td>
              <td className="p-3 font-bold text-green-600">
                ${prov.cxc?.toLocaleString() || "0"}
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

export default ProveedoresTable;
