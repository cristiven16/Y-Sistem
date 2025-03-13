// src/pages/Usuarios/UsuarioDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Usuario } from "./usuariosTypes";

Modal.setAppElement("#root");

interface UsuarioDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onEdit: (id: number) => void;
}

const UsuarioDetailsModal: React.FC<UsuarioDetailsModalProps> = ({
  isOpen,
  onClose,
  usuario,
  onEdit,
}) => {
  if (!isOpen || !usuario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal-overlay"
      contentLabel="Detalles del Usuario"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Usuario
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {usuario.id}
        </p>
        <p>
          <strong>Nombre:</strong> {usuario.nombre}
        </p>
        <p>
          <strong>Email:</strong> {usuario.email}
        </p>
        <p>
          <strong>Rol:</strong> {usuario.rol_id ?? "N/A"}
        </p>
        <p>
          <strong>Organización:</strong> {usuario.organizacion_id ?? "N/A"}
        </p>
        <p>
          <strong>Estado:</strong> {usuario.estado}
        </p>
        <p>
          <strong>MFA:</strong> {usuario.tiene_mfa ? "Sí" : "No"}
        </p>
        {/* Agrega más campos si tu backend los retorna */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(usuario.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default UsuarioDetailsModal;
