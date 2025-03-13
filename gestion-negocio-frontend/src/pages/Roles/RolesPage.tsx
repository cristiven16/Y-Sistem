// src/pages/Roles/RolesPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { getRoles, deleteRole } from "../../api/rolesAPI";
import { Role, PaginatedRoles } from "./rolesTypes";
import RolesTable from "./RolesTable";
import RoleForm from "./RoleForm";
import RoleDetailsModal from "./RoleDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

/**
 * Página principal para listar (con paginación/búsqueda),
 * crear, editar, ver detalles y eliminar roles.
 */
const RolesPage: React.FC = () => {
  // Lista de roles y paginación
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Rol seleccionado para editar / ver detalles / eliminar
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Cargar roles al montar
  useEffect(() => {
    fetchRoles(1, search);
    // eslint-disable-next-line
  }, []);

  // Si cambia la búsqueda
  useEffect(() => {
    fetchRoles(1, search);
    // eslint-disable-next-line
  }, [search]);

  async function fetchRoles(pageNumber: number, searchText: string) {
    setLoading(true);
    setError(null);
    try {
      const resp: PaginatedRoles = await getRoles(searchText, pageNumber, 10);
      setRoles(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener roles:", err);
      setError("No se pudo cargar la lista de roles.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    fetchRoles(pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => abre modal
  function handleCreate() {
    setSelectedRole(null);
    setIsCreateOpen(true);
  }

  // Edit => abre modal
  function handleEdit(id: number) {
    const found = roles.find((r) => r.id === id) || null;
    setSelectedRole(found);
    setIsEditOpen(true);
  }

  // Ver detalles => abre modal
  function handleViewDetails(id: number) {
    const found = roles.find((r) => r.id === id) || null;
    setSelectedRole(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => open confirm
  function handleDelete(id: number) {
    const found = roles.find((r) => r.id === id) || null;
    setSelectedRole(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      toast.success("Rol eliminado con éxito.");
      fetchRoles(page, search);
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      toast.error("No se pudo eliminar el rol.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedRole(null);
    }
  }

  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedRole(null);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Roles</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar rol..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Rol
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {roles.length === 0 ? (
            <div>No hay roles registrados</div>
          ) : (
            <>
              <RolesTable
                roles={roles}
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
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`page-btn ${
                        num === page ? "page-btn-active" : ""
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
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

      {/* Modal Crear Rol */}
      <RoleForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchRoles(page, search)}
      />

      {/* Modal Editar Rol */}
      <RoleForm
        isOpen={isEditOpen}
        role={selectedRole}
        onClose={closeModals}
        onSuccess={() => {
          fetchRoles(page, search);
          closeModals();
        }}
      />

      {/* Modal Detalles Rol */}
      <RoleDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        role={selectedRole}
        onEdit={(roleId) => {
          setIsDetailsOpen(false);
          handleEdit(roleId);
        }}
      />

      {/* Confirm Modal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedRole
            ? `¿Seguro que deseas eliminar el rol "${selectedRole.nombre}"?`
            : "¿Seguro que deseas eliminar este rol?"
        }
      />
    </div>
  );
};

export default RolesPage;
