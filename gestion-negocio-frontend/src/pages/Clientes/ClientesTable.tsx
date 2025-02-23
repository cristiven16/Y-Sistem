import { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";

interface Cliente {
  id: number;
  nombre_razon_social: string;
  numero_documento: string;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  direccion: string;
  email: string;
  cxc?: number;
}

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ClientesTable: React.FC<ClientesTableProps> = ({ clientes, onEdit, onDelete }) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPorPagina = 5;

  // 📌 Manejo de clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 📌 Detectar si el menú debe abrirse arriba o abajo dinámicamente
  useEffect(() => {
    if (openMenuId !== null && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const espacioAbajo = windowHeight - buttonRect.bottom;
      const espacioArriba = buttonRect.top;

      // 📌 Si hay más espacio abajo que arriba, abrir abajo. Si no, abrir arriba.
      if (espacioAbajo > menuHeight || espacioAbajo > espacioArriba) {
        setMenuPosition("bottom");
      } else {
        setMenuPosition("top");
      }
    }
  }, [openMenuId]);

  // 📌 Paginación
  const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);
  const clientesPaginados = clientes.slice((currentPage - 1) * clientesPorPagina, currentPage * clientesPorPagina);

  return (
    <div className="table-container p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="table-header">
            <th className="p-3 text-left">Acciones</th>
            <th className="p-3 text-left">Cliente</th>
            <th className="p-3 text-left">Teléfono</th>
            <th className="p-3 text-left">Dirección</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">CXC</th>
          </tr>
        </thead>
        <tbody>
          {clientesPaginados.map((cliente) => (
            <tr key={cliente.id} className="table-row">
              {/* 📌 Menú de Acciones */}
              <td className="p-3 relative">
                <div className="action-menu inline-block text-left">
                  <button
                    ref={buttonRef}
                    className="action-button"
                    onClick={() => setOpenMenuId(openMenuId === cliente.id ? null : cliente.id)}
                  >
                    <FaEllipsisV />
                  </button>

                  {openMenuId === cliente.id && (
                    <div
                      ref={menuRef}
                      className={`action-dropdown ${menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"} absolute left-0 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50`}
                    >
                      <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onEdit(cliente.id)}>
                        <FaEdit className="text-blue-500 w-4 h-4" /> <span className="text-gray-800">Editar</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onDelete(cliente.id)}>
                        <FaTrash className="text-red-500 w-4 h-4" /> <span className="text-gray-800">Eliminar</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100">
                        <FaInfoCircle className="text-gray-500 w-4 h-4" /> <span className="text-gray-800">Ver detalles</span>
                      </button>
                    </div>
                  )}
                </div>
              </td>

              {/* 📌 Cliente */}
              <td className="p-3">
                <div className="font-bold">{cliente.nombre_razon_social}</div>
                <div className="text-sm text-gray-600">CC. {cliente.numero_documento}</div>
              </td>

              {/* 📌 Teléfono */}
              <td className="p-3">
                {cliente.whatsapp && <div>WhatsApp: {cliente.whatsapp}</div>}
                {cliente.celular && <div>Celular: {cliente.celular}</div>}
                {cliente.telefono1 && <div>Teléfono: {cliente.telefono1}</div>}
              </td>

              {/* 📌 Dirección */}
              <td className="p-3">{cliente.direccion}</td>

              {/* 📌 Email */}
              <td className="p-3">{cliente.email}</td>

              {/* 📌 Cuentas por Cobrar */}
              <td className="p-3 font-bold text-green-600">${cliente.cxc?.toLocaleString() || "0"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📌 Paginación */}
      <div className="pagination">
        <button
          className={`page-btn ${currentPage === 1 && "opacity-50 cursor-not-allowed"}`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Anterior
        </button>
        <span className="mx-2">Página {currentPage} de {totalPaginas}</span>
        <button
          className={`page-btn ${currentPage === totalPaginas && "opacity-50 cursor-not-allowed"}`}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ClientesTable;
