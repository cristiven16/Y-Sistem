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

/** Interfaz principal de Cliente */
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

/** Props del componente ClientesTable */
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

  // Función para concatenar todos los números de contacto
  // (celular, telefono1, telefono2, whatsapp) si existen
  const getAllContactNumbers = (cliente: Cliente) => {
    const contacts: string[] = [];
    if (cliente.celular) contacts.push(cliente.celular);
    if (cliente.telefono1) contacts.push(cliente.telefono1);
    if (cliente.telefono2) contacts.push(cliente.telefono2);
    if (cliente.whatsapp) contacts.push(`WhatsApp: ${cliente.whatsapp}`);
    if (contacts.length === 0) return "N/A";
    return contacts.join(" | "); // o ", " o "\n"
  };

  return (
    <div className="table-container p-4">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="table-header">
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
            <tr key={cliente.id} className="table-row">
              {/* ACCIONES: Menú de 3 puntitos */}
              <td className="p-3 relative">
                <button
                  ref={buttonRef}
                  onClick={() =>
                    setOpenMenuId(openMenuId === cliente.id ? null : cliente.id)
                  }
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
                {openMenuId === cliente.id && (
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
                        onEdit(cliente.id);
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
                        onDelete(cliente.id); // El padre maneja confirm
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
                        onViewDetails(cliente.id);
                      }}
                    >
                      <FaInfoCircle className="text-gray-500 w-4 h-4" />
                      <span className="text-gray-800">Ver detalles</span>
                    </button>
                  </div>
                )}
              </td>

              {/* Cliente: Nombre + Documento */}
              <td className="p-3 text-center">
                <div className="font-bold">{cliente.nombre_razon_social}</div>
                {cliente.tipo_documento ? (
                  <div className="text-sm text-gray-500">
                    {cliente.tipo_documento.abreviatura} {cliente.numero_documento}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {cliente.numero_documento}
                  </div>
                )}
              </td>

              {/* Teléfonos: todos los disponibles */}
              <td className="p-3">{getAllContactNumbers(cliente)}</td>

              {/* Dirección (puedes mostrar depto/ciudad si quieres) */}
              <td className="p-3 text-center">
                {cliente.ciudad ? (
                  <div className="text-sm text-gray-500">{cliente.ciudad.nombre}</div>
                ) : null}
                <div className="font-semibold">{cliente.direccion}</div>
              </td>

              {/* Email */}
              <td className="p-3">{cliente.email}</td>

              {/* CXC */}
              <td className="p-3 font-bold text-green-600">
                ${cliente.cxc?.toLocaleString() || "0"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesTable;
