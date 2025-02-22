import { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPorPagina = 5;

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
              <td className="p-3 relative">
                <div className="action-menu inline-block text-left">
                  <button className="action-button" onClick={() => setOpenMenuId(openMenuId === cliente.id ? null : cliente.id)}>
                    <FaEllipsisV />
                  </button>
                  {openMenuId === cliente.id && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50">
                      <button className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onEdit(cliente.id)}>
                        <FaEdit className="text-blue-500 w-5 h-5" /> <span>Editar</span>
                      </button>
                      <button className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onDelete(cliente.id)}>
                        <FaTrash className="text-red-500 w-5 h-5" /> <span>Eliminar</span>
                      </button>
                      <button className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-gray-100">
                        <FaInfoCircle className="text-gray-500 w-5 h-5" /> <span>Ver detalles</span>
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="font-bold">{cliente.nombre_razon_social}</div>
                <div className="text-sm text-gray-600">CC. {cliente.numero_documento}</div>
              </td>
              <td className="p-3">
                {cliente.whatsapp && <div>WhatsApp: {cliente.whatsapp}</div>}
                {cliente.celular && <div>Celular: {cliente.celular}</div>}
                {cliente.telefono1 && <div>Teléfono: {cliente.telefono1}</div>}
              </td>
              <td className="p-3">{cliente.direccion}</td>
              <td className="p-3">{cliente.email}</td>
              <td className="p-3 font-bold text-green-600">${cliente.cxc?.toLocaleString() || "0"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesTable;
