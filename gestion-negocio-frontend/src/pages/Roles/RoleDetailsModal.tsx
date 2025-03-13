// src/pages/Roles/RoleDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Role } from "./rolesTypes";

Modal.setAppElement("#root");

interface RoleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onEdit: (id: number) => void;
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
  isOpen,
  onClose,
  role,
  onEdit,
}) => {
  if (!isOpen || !role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles del Rol"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">Detalles del Rol</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {role.id}
        </p>
        <p>
          <strong>Nombre:</strong> {role.nombre}
        </p>
        <p>
          <strong>Descripción:</strong> {role.descripcion || "N/A"}
        </p>
        <p>
          <strong>Organización:</strong> {role.organizacion_id ?? "N/A"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(role.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default RoleDetailsModal;
