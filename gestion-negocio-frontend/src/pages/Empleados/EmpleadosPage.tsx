// src/pages/Empleados/EmpleadosPage.tsx
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  obtenerEmpleados,
  eliminarEmpleado,
} from "../../api/empleadosAPI";
import EmpleadosTable from "./EmpleadosTable";
import EmpleadoForm from "./EmpleadoForm";
import EmpleadoDetailsModal from "../../components/EmpleadoDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";
import { Empleado } from "./empleadosTypes";

const EmpleadosPage: React.FC = () => {
  // 1. Lista de empleados y paginación
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // 2. Búsqueda y estados
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Control de modales (crear, detalles, editar, confirm)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Empleado seleccionado para editar/eliminar/detalles
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  // ─────────────────────────────────────────────────────────
  // Función para cargar empleados con paginación y búsqueda
  // ─────────────────────────────────────────────────────────
  const fetchEmpleados = async (pageNumber: number, searchText: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await obtenerEmpleados(pageNumber, searchText);
      // resp = { data, page, total_paginas, total_registros }
      setEmpleados(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error(err);
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  // Al montar, cargar sin filtro
  useEffect(() => {
    fetchEmpleados(1, "");
  }, []);

  // Si cambia 'search', recargamos desde página 1
  useEffect(() => {
    fetchEmpleados(1, search);
  }, [search]);

  // ─────────────────────────────────────────────────────────
  // Manejo de búsqueda
  // ─────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const goToPage = (pageNumber: number) => {
    fetchEmpleados(pageNumber, search);
  };

  // ─────────────────────────────────────────────────────────
  // Eliminar
  // ─────────────────────────────────────────────────────────
  const handleDeleteEmpleado = (id: number) => {
    const found = empleados.find((e) => e.id === id) || null;
    setSelectedEmpleado(found);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmpleado) return;
    try {
      await eliminarEmpleado(selectedEmpleado.id);
      toast.success("Empleado eliminado con éxito.");
      // Recargamos la lista en la misma página
      fetchEmpleados(page, search);
    } catch (err) {
      console.error("Error al eliminar empleado:", err);
      toast.error("Ocurrió un error al eliminar el empleado.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedEmpleado(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Ver detalles
  // ─────────────────────────────────────────────────────────
  const handleViewDetails = (id: number) => {
    const found = empleados.find((e) => e.id === id) || null;
    setSelectedEmpleado(found);
    setIsDetailsOpen(true);
  };

  // ─────────────────────────────────────────────────────────
  // Editar
  // ─────────────────────────────────────────────────────────
  const handleEdit = (id: number) => {
    const found = empleados.find((e) => e.id === id) || null;
    setSelectedEmpleado(found);
    setIsEditOpen(true);
  };

  // ─────────────────────────────────────────────────────────
  // Cerrar modales
  // ─────────────────────────────────────────────────────────
  const closeModals = () => {
    setIsCreateOpen(false);
    setIsDetailsOpen(false);
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setSelectedEmpleado(null);
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Empleados</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-2 bg-blue-500 text-white rounded flex items-center"
        >
          <FaPlus className="mr-2" />
          Agregar Empleado
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {empleados.length === 0 ? (
            <div className="text-center mt-4">No hay resultados</div>
          ) : (
            <EmpleadosTable
              empleados={empleados}
              onDelete={handleDeleteEmpleado}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          )}

          {/* Paginación */}
          <div className="pagination mt-4 flex gap-2">
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

      {/* Modal Crear Empleado */}
      <EmpleadoForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          // recarga la lista en la página actual
          fetchEmpleados(page, search);
        }}
      />

      {/* Modal Detalles Empleado */}
      <EmpleadoDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        empleado={selectedEmpleado}
        onEdit={(empId) => {
          setIsDetailsOpen(false);
          handleEdit(empId);
        }}
      />

      {/* Modal Editar Empleado */}
      <EmpleadoForm
        isOpen={isEditOpen}
        empleado={selectedEmpleado}
        onClose={closeModals}
        onSuccess={() => {
          fetchEmpleados(page, search);
          closeModals();
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedEmpleado
            ? `¿Estás seguro de eliminar al empleado "${selectedEmpleado.nombre_razon_social}"?`
            : "¿Estás seguro de eliminar este empleado?"
        }
      />
    </div>
  );
};

export default EmpleadosPage;
