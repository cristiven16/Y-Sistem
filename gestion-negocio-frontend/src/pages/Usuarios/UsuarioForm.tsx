// src/pages/Usuarios/UsuarioForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  Usuario,
  UsuarioCreatePayload,
  UsuarioUpdatePayload,
} from "./usuariosTypes";
import {
  createUser,
  updateUserPartial,
} from "../../api/usersAPI";
import { getRoles, Role } from "../../api/rolesAPI";
import { useAuth } from "../../hooks/useAuth";

Modal.setAppElement("#root");

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario?: Usuario; // en modo edición
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  usuario,
}) => {
  const [loading, setLoading] = useState(false);

  // Lista de roles para el <select>, asumimos que un usuario debe tener un rol
  const [roles, setRoles] = useState<Role[]>([]);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState<number>(0);
  const [estado, setEstado] = useState("activo"); // "activo" | "bloqueado" | "inactivo"

  // Para la organización se asume la org del usuario actual
  const { user: currentUser } = useAuth();
  const organizacionDelFormulario = currentUser?.organizacion_id ?? null;

  // Cargar roles e inicializar form
  useEffect(() => {
    if (isOpen) {
      loadRoles();

      if (usuario) {
        // Edición
        setNombre(usuario.nombre);
        setEmail(usuario.email);
        setPassword("");
        setRolId(usuario.rol_id || 0);
        setEstado(usuario.estado);
      } else {
        // Creación
        setNombre("");
        setEmail("");
        setPassword("");
        setRolId(0);
        setEstado("activo");
      }
    }
  }, [isOpen, usuario]);

  async function loadRoles() {
    try {
      // Podrías filtrar o no
      const resp = await getRoles("", 1, 9999); 
      // "getRoles" retorna un objeto con { data, ... } 
      // Ajusta si tu rolesAPI es diferente
      setRoles(resp.data);
    } catch (error) {
      console.error("Error al cargar roles:", error);
      toast.error("No se pudieron cargar los roles.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!rolId || rolId === 0) {
      toast.error("Debes seleccionar un rol.");
      return;
    }

    setLoading(true);
    try {
      if (usuario && usuario.id) {
        // EDITAR => PATCH /users/{id}
        const payload: UsuarioUpdatePayload = {};
        if (nombre !== usuario.nombre) payload.nombre = nombre;
        if (email !== usuario.email) payload.email = email;
        if (password.trim()) payload.password = password; // solo si cambian pass
        if (rolId !== usuario.rol_id) payload.rol_id = rolId;
        if (estado !== usuario.estado) payload.estado = estado as any;

        await updateUserPartial(usuario.id, payload);
        toast.success("Usuario actualizado con éxito.");
      } else {
        // CREAR => POST /users
        if (!password.trim()) {
          toast.error("La contraseña es obligatoria al crear un usuario.");
          setLoading(false);
          return;
        }
        const payload: UsuarioCreatePayload = {
          nombre,
          email,
          password,
          rol_id: rolId,
          organizacion_id: organizacionDelFormulario ?? undefined,
        };
        await createUser(payload);
        toast.success("Usuario creado con éxito.");
      }

      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el usuario.");
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
      contentLabel="UsuarioForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {usuario ? "Editar Usuario" : "Crear Usuario"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD (opcional en edición) */}
        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              usuario ? "Dejar en blanco si no se cambia" : "Contraseña"
            }
          />
        </div>

        {/* SELECT ROL */}
        <div>
          <label className="label" htmlFor="rolSelect">
            Rol
          </label>
          <select
            id="rolSelect"
            className="input-field"
            value={rolId}
            onChange={(e) => setRolId(Number(e.target.value))}
            required
          >
            <option value={0}>-- Selecciona un rol --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* ESTADO (solo en modo edición) */}
        {usuario && (
          <div>
            <label className="label" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              className="input-field"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="activo">Activo</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2">
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

export default UsuarioForm;
