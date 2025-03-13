// src/pages/Permissions/PermissionsPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
// Importa tu API
import { getPermissions, deletePermission } from "../../api/permissionsAPI";
import { Permission, PaginatedPermissions } from "./permissionsTypes";
import PermissionsTable from "./PermissionsTable";
import PermissionForm from "./PermissionForm";
import PermissionDetailsModal from "./PermissionDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

const PermissionsPage: React.FC = () => {
  // Estado
  const [permissions, setPermissions] = useState<Permission[]>([]);
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

  // Permiso seleccionado para editar / ver detalles / eliminar
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Cargar permisos
  useEffect(() => {
    fetchPermissions(1, search);
    // eslint-disable-next-line
  }, []);

  // Cada vez que cambie `search`
  useEffect(() => {
    fetchPermissions(1, search);
    // eslint-disable-next-line
  }, [search]);

  async function fetchPermissions(pageNumber: number, searchText: string) {
    setLoading(true);
    setError(null);
    try {
      const resp: PaginatedPermissions = await getPermissions(searchText, pageNumber, 10);
      setPermissions(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err: any) {
      console.error("Error al obtener permisos:", err);
      setError("No se pudo cargar la lista de permisos.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    fetchPermissions(pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => abrir modal
  function handleCreate() {
    setSelectedPermission(null);
    setIsCreateOpen(true);
  }

  // Edit => abrir modal
  function handleEdit(id: number) {
    const found = permissions.find((p) => p.id === id) || null;
    setSelectedPermission(found);
    setIsEditOpen(true);
  }

  // Detalles => abrir modal
  function handleViewDetails(id: number) {
    const found = permissions.find((p) => p.id === id) || null;
    setSelectedPermission(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => abrir confirm
  function handleDelete(id: number) {
    const found = permissions.find((p) => p.id === id) || null;
    setSelectedPermission(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedPermission) return;
    try {
      await deletePermission(selectedPermission.id);
      toast.success("Permiso eliminado con éxito.");
      fetchPermissions(page, search);
    } catch (err) {
      console.error("Error al eliminar permiso:", err);
      toast.error("No se pudo eliminar el permiso.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedPermission(null);
    }
  }

  // Cerrar modales
  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedPermission(null);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Permisos</h1>

      {/* Barra de búsqueda + Botón Crear */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar permiso..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Permiso
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {permissions.length === 0 ? (
            <div>No hay permisos registrados</div>
          ) : (
            <>
              <PermissionsTable
                permissions={permissions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación */}
              <div className="pagination mt-4">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="page-btn"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={
                        "page-btn " + (pageNumber === page ? "page-btn-active" : "")
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                })}
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

      {/* Modal Crear Permiso */}
      <PermissionForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchPermissions(page, search)}
      />

      {/* Modal Editar Permiso */}
      <PermissionForm
        isOpen={isEditOpen}
        permission={selectedPermission}
        onClose={closeModals}
        onSuccess={() => {
          fetchPermissions(page, search);
          closeModals();
        }}
      />

      {/* Modal Detalles de Permiso */}
      <PermissionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        permission={selectedPermission}
        onEdit={handleEdit}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedPermission
            ? `¿Seguro que deseas eliminar el permiso "${selectedPermission.nombre}"?`
            : "¿Seguro que deseas eliminar este permiso?"
        }
      />
    </div>
  );
};

export default PermissionsPage;
