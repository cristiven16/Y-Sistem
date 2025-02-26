import React from "react";
import Modal from "react-modal";
import { Cliente } from "../pages/Clientes/ClientesTypes";

Modal.setAppElement("#root");

interface ClienteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null; // el cliente a visualizar
  onEdit: (id: number) => void; // callback para abrir edición
}

const ClienteDetailsModal: React.FC<ClienteDetailsModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onEdit
}) => {
  if (!isOpen || !cliente) return null; // si está cerrado o no hay cliente

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

      <h2 className="text-xl font-bold mb-4 text-center">Detalles del Cliente</h2>


      {/* 
        Grid responsiva:
        - 1 columna en pantallas pequeñas 
        - 2 columnas en >= sm (≥640px)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p><strong>ID:</strong> {cliente.id}</p>
        <p><strong>Nombre:</strong> {cliente.nombre_razon_social}</p>
        <p><strong>Número Documento:</strong> {cliente.numero_documento}</p>
        <p><strong>Tipo Documento:</strong> {cliente.tipo_documento?.abreviatura}</p>
        <p><strong>Teléfono1:</strong> {cliente.telefono1}</p>
        <p><strong>Teléfono2:</strong> {cliente.telefono2}</p>
        <p><strong>Celular:</strong> {cliente.celular}</p>
        <p><strong>WhatsApp:</strong> {cliente.whatsapp}</p>
        <p><strong>Departamento:</strong> {cliente.departamento?.nombre}</p>
        <p><strong>Ciudad:</strong> {cliente.ciudad?.nombre}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>CXC:</strong> {cliente.cxc}</p>
        {/* Añade más campos si tu schema lo permite */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();       // Cierro modal de detalle
            onEdit(cliente.id); // Abro modal de edición
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
