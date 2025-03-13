import React from "react";
import Modal from "react-modal";
import { ProveedorResponse } from "../pages/Proveedores/proveedoresTypes";

Modal.setAppElement("#root");

interface ProveedorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedor?: ProveedorResponse | undefined; // el proveedor a visualizar
  onEdit: (id: number) => void; // callback para abrir edición
}

const ProveedorDetailsModal: React.FC<ProveedorDetailsModalProps> = ({
  isOpen,
  onClose,
  proveedor,
  onEdit
}) => {
  if (!isOpen || !proveedor) return undefined; // Si está cerrado o no hay proveedor

  // Puedes observar en consola qué llega realmente
  console.log("Detalles del Proveedor:", proveedor);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles del Proveedor"
    >
      {/* Botón X para cerrar */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Proveedor
      </h2>

      {/* Grid responsiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p><strong>ID:</strong> {proveedor.id}</p>
        <p><strong>Nombre:</strong> {proveedor.nombre_razon_social}</p>
        <p><strong>Número Documento:</strong> {proveedor.numero_documento}</p>

        {/* Usamos ?. para prevenir error si tipo_documento es undefined */}
        <p>
          <strong>Tipo Documento:</strong>{" "}
          {proveedor.tipo_documento?.abreviatura || "N/A"}
        </p>

        <p><strong>Teléfono1:</strong> {proveedor.telefono1 || "N/A"}</p>
        <p><strong>Teléfono2:</strong> {proveedor.telefono2 || "N/A"}</p>
        <p><strong>Celular:</strong> {proveedor.celular || "N/A"}</p>
        <p><strong>WhatsApp:</strong> {proveedor.whatsapp || "N/A"}</p>

        {/* Si guardas la relación de departamento y ciudad como objetos */}
        <p>
          <strong>Departamento:</strong>{" "}
          {proveedor.departamento?.nombre || "N/A"}
        </p>
        <p>
          <strong>Ciudad:</strong> {proveedor.ciudad?.nombre || "N/A"}
        </p>

        <p><strong>Dirección:</strong> {proveedor.direccion}</p>
        <p><strong>Email:</strong> {proveedor.email || "N/A"}</p>

        {/* Si manejas cxc */}
        <p>
          <strong>CXC:</strong> {proveedor.cxc !== undefined ? proveedor.cxc : "N/A"}
        </p>

        {/* Agrega más campos si tu schema lo permite */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(proveedor.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default ProveedorDetailsModal;
