// src/pages/Roles/RoleForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Role, RolePayload } from "./rolesTypes";
import { createRole, updateRole } from "../../api/rolesAPI";
import { useAuth } from "../../hooks/useAuth";

Modal.setAppElement("#root");

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;  // Para recargar la lista al terminar
  role?: Role | null;     // Modo edición si no es null
}

const initialForm: RolePayload = {
  nombre: "",
  descripcion: "",
  organizacion_id: null,
};

const RoleForm: React.FC<RoleFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role,
}) => {
  const [formData, setFormData] = useState<RolePayload>(initialForm);
  const [loading, setLoading] = useState(false);

  // Para obtener la org del usuario logueado, si lo deseas
  const { user: currentUser } = useAuth();
  const orgId = currentUser?.organizacion_id ?? null;

  useEffect(() => {
    if (isOpen) {
      if (role) {
        // Modo edición
        setFormData({
          nombre: role.nombre,
          descripcion: role.descripcion || "",
          organizacion_id: role.organizacion_id || null,
        });
      } else {
        // Modo creación => podrías asignar la org del user
        setFormData({
          nombre: "",
          descripcion: "",
          organizacion_id: orgId,
        });
      }
    }
  }, [isOpen, role, orgId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (role && role.id) {
        // Editar => PUT /roles/{id}
        await updateRole(role.id, formData);
        toast.success("Rol actualizado con éxito.");
      } else {
        // Crear => POST /roles
        await createRole(formData);
        toast.success("Rol creado con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar el rol:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el rol.");
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
      contentLabel="RoleForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {role ? "Editar Rol" : "Crear Rol"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* NOMBRE */}
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

        {/* DESCRIPCIÓN */}
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

        {/* organizacion_id no se muestra, se asigna silenciosamente, 
            a menos que quieras exponerlo en el form... */}

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

export default RoleForm;
