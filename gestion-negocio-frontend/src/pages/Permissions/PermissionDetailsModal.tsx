// src/pages/Permissions/PermissionDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Permission } from "./permissionsTypes";

Modal.setAppElement("#root");

interface PermissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onEdit: (id: number) => void;
}

const PermissionDetailsModal: React.FC<PermissionDetailsModalProps> = ({
  isOpen,
  onClose,
  permission,
  onEdit,
}) => {
  if (!isOpen || !permission) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles de Permiso"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Permiso
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {permission.id}
        </p>
        <p>
          <strong>Nombre:</strong> {permission.nombre}
        </p>
        <p>
          <strong>Descripción:</strong> {permission.descripcion || "N/A"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(permission.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default PermissionDetailsModal;
