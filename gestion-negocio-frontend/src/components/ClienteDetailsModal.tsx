// src/components/ClienteDetailsModal.tsx
import React from "react";
import Modal from "react-modal";
import { Cliente } from "../pages/Clientes/clientesTypes"; 
// ^ Ajusta la ruta si tu types de Cliente están en otro lugar

Modal.setAppElement("#root");

interface ClienteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;     // el cliente a visualizar
  onEdit: (id: number) => void; // callback para abrir edición
}

const ClienteDetailsModal: React.FC<ClienteDetailsModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onEdit
}) => {
  // Si el modal está cerrado o no hay cliente, no renderizamos nada
  if (!isOpen || !cliente) return null;

  // Puedes usar console.log para ver qué llega
  console.log("Detalles del Cliente:", cliente);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles del Cliente"
    >
      {/* Botón X para cerrar */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Cliente
      </h2>

      {/* Grid responsiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {cliente.id}
        </p>
        <p>
          <strong>Nombre:</strong> {cliente.nombre_razon_social}
        </p>
        <p>
          <strong>Número Documento:</strong> {cliente.numero_documento}
        </p>
        <p>
          <strong>Tipo Documento:</strong>{" "}
          {cliente.tipo_documento?.abreviatura || "N/A"}
        </p>

        <p>
          <strong>Teléfono1:</strong> {cliente.telefono1 || "N/A"}
        </p>
        <p>
          <strong>Teléfono2:</strong> {cliente.telefono2 || "N/A"}
        </p>
        <p>
          <strong>Celular:</strong> {cliente.celular || "N/A"}
        </p>
        <p>
          <strong>WhatsApp:</strong> {cliente.whatsapp || "N/A"}
        </p>

        <p>
          <strong>Departamento:</strong>{" "}
          {cliente.departamento?.nombre || "N/A"}
        </p>
        <p>
          <strong>Ciudad:</strong> {cliente.ciudad?.nombre || "N/A"}
        </p>

        <p>
          <strong>Dirección:</strong> {cliente.direccion || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {cliente.email || "N/A"}
        </p>

        {/* Ejemplo si manejas un campo cxc */}
        <p>
          <strong>CXC:</strong>{" "}
          {cliente.cxc !== undefined ? cliente.cxc : "N/A"}
        </p>

        {/* Agrega más campos si tu esquema lo requiere */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(cliente.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default ClienteDetailsModal;
