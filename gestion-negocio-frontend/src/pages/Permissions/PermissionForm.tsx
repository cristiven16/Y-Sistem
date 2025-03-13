// src/pages/Permissions/PermissionForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Permission, PermissionPayload } from "./permissionsTypes";
import { createPermission, updatePermission } from "../../api/permissionsAPI";

Modal.setAppElement("#root");

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;  // recargar la lista
  permission?: Permission | null;
}

const initialForm: PermissionPayload = {
  nombre: "",
  descripcion: "",
};

const PermissionForm: React.FC<PermissionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  permission,
}) => {
  const [formData, setFormData] = useState<PermissionPayload>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (permission) {
        // Edit mode
        setFormData({
          nombre: permission.nombre,
          descripcion: permission.descripcion || "",
        });
      } else {
        // Create mode
        setFormData({ ...initialForm });
      }
    }
  }, [isOpen, permission]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (permission && permission.id) {
        // Editar
        await updatePermission(permission.id, formData);
        toast.success("Permiso actualizado con éxito.");
      } else {
        // Crear
        await createPermission(formData);
        toast.success("Permiso creado con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar el permiso:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el permiso.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay"
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      contentLabel="PermissionForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {permission ? "Editar Permiso" : "Crear Permiso"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="input-field"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="label" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            className="input-field"
            value={formData.descripcion || ""}
            onChange={handleChange}
          />
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary bg-blue-600"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionForm;
