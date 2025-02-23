import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import Modal from "react-modal";
import { toast } from "react-toastify";

Modal.setAppElement("#root"); // Asegura accesibilidad del modal

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
  onViewDetails: (id: number) => void;
}

const ClientesTable: React.FC<ClientesTableProps> = ({ clientes, onEdit, onDelete, onViewDetails }) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

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

  useEffect(() => {
    if (openMenuId !== null && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 150; // Ajuste para asegurar espacio suficiente
      const windowHeight = window.innerHeight;
      
      if (windowHeight - buttonRect.bottom > menuHeight) {
        setMenuPosition("bottom");
      } else {
        setMenuPosition("top");
      }
    }
  }, [openMenuId]);

  const handleOpenModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCliente) {
      try {
        await onDelete(selectedCliente.id);
        setModalOpen(false);
        setOpenMenuId(null); // Cierra el menú después de eliminar
        toast.success("Cliente eliminado con éxito.");
      } catch (error) {
        toast.error("Error al eliminar cliente.");
      }
    }
  };
  

  return (
    <div className="table-container p-4">
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-bold">Confirmación</h2>
          <p className="mt-2">¿Estás seguro de eliminar a {selectedCliente?.nombre_razon_social}?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary bg-red-600" onClick={handleConfirmDelete}>
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="table-header">
            <th className="p-3">Acciones</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Dirección</th>
            <th className="p-3">Email</th>
            <th className="p-3">CXC</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="table-row">
              <td className="p-3 relative">
                <button
                  ref={buttonRef}
                  onClick={() => setOpenMenuId(openMenuId === cliente.id ? null : cliente.id)}
                  className="btn-secondary"
                >
                  <FaEllipsisV />
                </button>
                {openMenuId === cliente.id && (
                  <div ref={menuRef} className={`absolute left-0 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-50 p-2 ${menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"}`}>
                    <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onEdit(cliente.id)}>
                      <FaEdit className="text-blue-500 w-4 h-4" /> <span className="text-gray-800">Editar</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => handleOpenModal(cliente)}>
                      <FaTrash className="text-red-500 w-4 h-4" /> <span className="text-gray-800">Eliminar</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100" onClick={() => onViewDetails(cliente.id)}>
                      <FaInfoCircle className="text-gray-500 w-4 h-4" /> <span className="text-gray-800">Ver detalles</span>
                    </button>
                  </div>
                )}
              </td>
              <td className="p-3">{cliente.nombre_razon_social}</td>
              <td className="p-3">{cliente.celular || cliente.telefono1 || "N/A"}</td>
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
