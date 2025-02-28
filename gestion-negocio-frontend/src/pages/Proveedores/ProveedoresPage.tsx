import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

import ProveedoresTable from "./ProveedoresTable";
import ProveedorForm from "./ProveedorForm";
import ProveedorDetailsModal from "../../components/ProveedorDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

/** Interfaz mínima para un proveedor */
interface Proveedor {
  id: number;
  nombre_razon_social: string;
  numero_documento: string;
  direccion: string;
  // ... agrega más campos si lo requieres ...
}

const API_URL = "http://localhost:8000/proveedores"; 
// Ajusta la URL base según tu backend

const ProveedoresPage: React.FC = () => {
  // Estado para la lista de proveedores y paginación
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Búsqueda / estado de feedback
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Control de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Proveedor seleccionado para editar/eliminar/detalles
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Carga de proveedores (paginado y búsqueda)
  // ─────────────────────────────────────────────────────────────
  const fetchProveedores = async (pageNumber: number, searchText: string) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axios.get(`${API_URL}`, {
        params: { page: pageNumber, search: searchText },
      });
      /**
       * Si tu backend responde con
       * {
       *   data: Proveedor[],
       *   page: number,
       *   total_paginas: number,
       *   total_registros: number
       * }
       */
      setProveedores(resp.data.data);
      setPage(resp.data.page);
      setTotalPaginas(resp.data.total_paginas);
    } catch (err) {
      console.error(err);
      setError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  // Al montar, cargar página 1 sin filtro
  useEffect(() => {
    fetchProveedores(1, "");
  }, []);

  // Cada vez que cambie 'search', recargamos desde la página 1
  useEffect(() => {
    fetchProveedores(1, search);
  }, [search]);

  // ─────────────────────────────────────────────────────────────
  // Manejo de búsqueda
  // ─────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Paginación
  const goToPage = (pageNumber: number) => {
    fetchProveedores(pageNumber, search);
  };

  // ─────────────────────────────────────────────────────────────
  // Eliminar -> Abrir confirm modal
  // ─────────────────────────────────────────────────────────────
  const handleDeleteProveedor = (id: number) => {
    const found = proveedores.find((p) => p.id === id) || null;
    setSelectedProveedor(found);
    setIsConfirmOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedProveedor) return;
    try {
      await axios.delete(`${API_URL}/${selectedProveedor.id}`);
      toast.success("Proveedor eliminado con éxito.");
      // Recargar la lista en la misma página
      fetchProveedores(page, search);
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      toast.error("Ocurrió un error al eliminar el proveedor.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedProveedor(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Ver detalles
  // ─────────────────────────────────────────────────────────────
  const handleViewDetails = (id: number) => {
    const found = proveedores.find((p) => p.id === id) || null;
    setSelectedProveedor(found);
    setIsDetailsOpen(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Editar
  // ─────────────────────────────────────────────────────────────
  const handleEdit = (id: number) => {
    const found = proveedores.find((p) => p.id === id) || null;
    setSelectedProveedor(found);
    setIsEditOpen(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Cerrar modales
  // ─────────────────────────────────────────────────────────────
  const closeModals = () => {
    setIsCreateOpen(false);
    setIsDetailsOpen(false);
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setSelectedProveedor(null);
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proveedores</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-2 bg-blue-500 text-white rounded flex items-center"
        >
          <FaPlus className="mr-2" />
          Agregar Proveedor
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {proveedores.length === 0 ? (
            <div className="text-center mt-4">No hay resultados</div>
          ) : (
            <ProveedoresTable
              proveedores={proveedores}
              onDelete={handleDeleteProveedor}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          )}

          {/* Paginación */}
          <div className="pagination mt-4">
            <button
              onClick={() => goToPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className={"page-btn " + (page === 1 ? "page-btn-disabled" : "")}
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
                    "page-btn " +
                    (pageNumber === page ? "page-btn-active" : "")
                  }
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(Math.min(page + 1, totalPaginas))}
              disabled={page === totalPaginas}
              className={
                "page-btn " + (page === totalPaginas ? "page-btn-disabled" : "")
              }
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal Crear Proveedor */}
      <ProveedorForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchProveedores(page, search);
        }}
      />

      {/* Modal Detalles Proveedor */}
      <ProveedorDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        proveedor={selectedProveedor}
        onEdit={(proveedorId) => {
          setIsDetailsOpen(false);
          handleEdit(proveedorId);
        }}
      />

      {/* Modal Editar Proveedor */}
      <ProveedorForm
        isOpen={isEditOpen}
        proveedor={selectedProveedor}
        onClose={closeModals}
        onSuccess={() => {
          fetchProveedores(page, search);
          closeModals();
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedProveedor
            ? `¿Estás seguro de eliminar al proveedor "${selectedProveedor.nombre_razon_social}"?`
            : "¿Estás seguro de eliminar este proveedor?"
        }
      />
    </div>
  );
};

export default ProveedoresPage;
