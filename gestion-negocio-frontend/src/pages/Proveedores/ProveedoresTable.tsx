import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";

/** Interfaz para "TipoDocumento" */
interface TipoDocumento {
  id: number;
  nombre: string;
  abreviatura: string;
}

/** Interfaz para "Departamento" */
interface Departamento {
  id: number;
  nombre: string;
}

/** Interfaz para "Ciudad" */
interface Ciudad {
  id: number;
  nombre: string;
}

/** Interfaz principal de Proveedor */
interface Proveedor {
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
  cxc?: number; // si manejas cuentas por cobrar con proveedores (?)
}

/** Props del componente ProveedoresTable */
interface ProveedoresTableProps {
  proveedores: Proveedor[];
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
  // Manejo del menú de acciones por fila
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

  // Cerrar menú al hacer clic fuera
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

  // Decide si el menú se muestra "arriba" o "abajo"
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

  /**
   * Función para concatenar todos los números de contacto
   * (celular, telefono1, telefono2, whatsapp) si existen
   */
  const getAllContactNumbers = (prov: Proveedor) => {
    const contacts: string[] = [];
    if (prov.celular) contacts.push(prov.celular);
    if (prov.telefono1) contacts.push(prov.telefono1);
    if (prov.telefono2) contacts.push(prov.telefono2);
    if (prov.whatsapp) contacts.push(`WhatsApp: ${prov.whatsapp}`);
    if (contacts.length === 0) return "N/A";
    return contacts.join(" | ");
  };

  return (
    <div className="table-container p-4">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="table-header">
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
            <tr key={prov.id} className="table-row">
              {/* ACCIONES: Menú de 3 puntitos */}
              <td className="p-3 relative">
                <button
                  ref={buttonRef}
                  onClick={() =>
                    setOpenMenuId(openMenuId === prov.id ? null : prov.id)
                  }
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
                {openMenuId === prov.id && (
                  <div
                    ref={menuRef}
                    className={`absolute left-0 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50 p-2 ${
                      menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                  >
                    {/* Editar */}
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(prov.id);
                      }}
                    >
                      <FaEdit className="text-blue-500 w-4 h-4" />
                      <span className="text-gray-800">Editar</span>
                    </button>
                    {/* Eliminar */}
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(prov.id);
                      }}
                    >
                      <FaTrash className="text-red-500 w-4 h-4" />
                      <span className="text-gray-800">Eliminar</span>
                    </button>
                    {/* Ver detalles */}
                    <button
                      className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => {
                        setOpenMenuId(null);
                        onViewDetails(prov.id);
                      }}
                    >
                      <FaInfoCircle className="text-gray-500 w-4 h-4" />
                      <span className="text-gray-800">Ver detalles</span>
                    </button>
                  </div>
                )}
              </td>

              {/* Proveedor: Nombre + Documento */}
              <td className="p-3 text-center">
                <div className="font-bold">{prov.nombre_razon_social}</div>
                {prov.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {prov.tipo_documento.abreviatura} {prov.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {prov.numero_documento}
                  </div>
                )}
              </td>

              {/* Teléfonos */}
              <td className="p-3">{getAllContactNumbers(prov)}</td>

              {/* Dirección (puedes mostrar depto/ciudad si quieres) */}
              <td className="p-3 text-center">
                {prov.ciudad ? (
                  <div className="text-sm text-gray-500">{prov.ciudad.nombre}</div>
                ) : null}
                <div className="font-semibold">{prov.direccion}</div>
              </td>

              {/* Email */}
              <td className="p-3">{prov.email}</td>

              {/* CXC */}
              <td className="p-3 font-bold text-green-600">
                ${prov.cxc?.toLocaleString() || "0"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProveedoresTable;
