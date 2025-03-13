import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { getUsersByOrg, deleteUser } from "../../api/usersAPI"; 
// ^ Importamos getUsersByOrg en vez de getUsers
import { Usuario, PaginatedUsuarios } from "./usuariosTypes";
import UsuarioForm from "./UsuarioForm";
import UsuarioDetailsModal from "./UsuarioDetailsModal";
import UsuariosTable from "./UsuariosTable";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";

const UsuariosPage: React.FC = () => {
  const { user } = useAuth();  // Para obtener la org y filtrar
  const orgId = user?.organizacion_id;

  // Lista de usuarios, paginación
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Usuario seleccionado para editar / ver detalles / eliminar
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | undefined>(undefined);

  // Al montar o cuando orgId esté disponible => cargar usuarios
  useEffect(() => {
    if (orgId) {
      fetchUsuariosByOrg(orgId, 1, search);
    }
  }, [orgId]);

  // Cuando cambia 'search'
  useEffect(() => {
    if (orgId) {
      fetchUsuariosByOrg(orgId, 1, search);
    }
  }, [search, orgId]);

  async function fetchUsuariosByOrg(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(undefined);
    try {
      // Llamamos a getUsersByOrg en lugar de getUsers
      const resp: PaginatedUsuarios = await getUsersByOrg(orgId, searchText, pageNumber, 10);
      setUsuarios(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    if (orgId) {
      fetchUsuariosByOrg(orgId, pageNumber, search);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => abre modal
  function handleCreate() {
    setSelectedUsuario(undefined);
    setIsCreateOpen(true);
  }

  // Editar => abre modal
  function handleEdit(id: number) {
    const found = usuarios.find((u) => u.id === id);
    setSelectedUsuario(found);
    setIsEditOpen(true);
  }

  // Detalles => abre modal
  function handleViewDetails(id: number) {
    const found = usuarios.find((u) => u.id === id);
    setSelectedUsuario(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => open confirm
  function handleDelete(id: number) {
    const found = usuarios.find((u) => u.id === id);
    setSelectedUsuario(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedUsuario) return;
    try {
      await deleteUser(selectedUsuario.id);
      toast.success("Usuario eliminado con éxito.");
      // Recargamos la lista en la misma página
      if (orgId) {
        fetchUsuariosByOrg(orgId, page, search);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("No se pudo eliminar el usuario.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedUsuario(undefined);
    }
  }

  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedUsuario(undefined);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
          disabled={!orgId}
        >
          <FaPlus className="mr-2" />
          Agregar Usuario
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !orgId ? (
        <div>No tienes organización asignada. No se pueden listar usuarios.</div>
      ) : (
        <>
          {usuarios.length === 0 ? (
            <div>No hay usuarios</div>
          ) : (
            <>
              <UsuariosTable
                usuarios={usuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación */}
              <div className="pagination mt-4 flex gap-2">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="page-btn"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => goToPage(num)}
                    className={`page-btn ${num === page ? "page-btn-active" : ""}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(Math.min(page + 1, totalPaginas))}
                  disabled={page === totalPaginas}
                  className="page-btn"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal Crear */}
      <UsuarioForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => orgId && fetchUsuariosByOrg(orgId, page, search)}
      />

      {/* Modal Editar */}
      <UsuarioForm
        isOpen={isEditOpen}
        usuario={selectedUsuario}
        onClose={closeModals}
        onSuccess={() => {
          if (orgId) {
            fetchUsuariosByOrg(orgId, page, search);
          }
          closeModals();
        }}
      />

      {/* Modal Detalles */}
      <UsuarioDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        usuario={selectedUsuario || null}
        onEdit={(id) => {
          setIsDetailsOpen(false);
          handleEdit(id);
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedUsuario
            ? `¿Seguro que deseas eliminar al usuario "${selectedUsuario.email}"?`
            : "¿Seguro que deseas eliminar este usuario?"
        }
      />
    </div>
  );
};

export default UsuariosPage;
