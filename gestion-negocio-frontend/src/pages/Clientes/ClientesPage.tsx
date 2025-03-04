// src/pages/Clientes/ClientesPage.tsx
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import ClientesTable from "./ClientesTable";
import ClienteForm from "./ClienteForm";
import ClienteDetailsModal from "../../components/ClienteDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

// Importa tus funciones de clientesAPI
import { 
  getClientes,
  deleteCliente,
} from "../../api/clientesAPI";

/**
 * Ajusta la interfaz para tu tabla, 
 * o reutiliza "ClienteResponse" de clientesTypes.ts 
 * si prefieres un tipado más completo.
 */
interface Cliente {
  id: number;
  nombre_razon_social: string;
  numero_documento: string;
  direccion: string;
  // ... más campos si lo requieres ...
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Búsqueda y estado
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // ─────────────────────────────────────────────────────────
  // Carga de clientes
  // ─────────────────────────────────────────────────────────
  const fetchClientes = async (pageNumber: number, searchText: string) => {
    try {
      setLoading(true);
      setError(null);

      // Llamamos a getClientes(...) en lugar de axios.get(...)
      // getClientes retorna { data, page, total_paginas, total_registros }
      const resp = await getClientes(searchText, pageNumber, 10); // page_size=10 (ajusta si quieres)
      
      // resp.data => array de clientes
      // resp.page => número de página actual
      // resp.total_paginas => total de páginas
      setClientes(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error(err);
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  // Cargar sin filtro la primera vez
  useEffect(() => {
    fetchClientes(1, "");
  }, []);

  // Si cambia 'search', recargamos desde página 1
  useEffect(() => {
    fetchClientes(1, search);
  }, [search]);

  // ─────────────────────────────────────────────────────────
  // Manejo de búsqueda
  // ─────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Ir a otra página
  const goToPage = (pageNumber: number) => {
    fetchClientes(pageNumber, search);
  };

  // ─────────────────────────────────────────────────────────
  // Eliminar
  // ─────────────────────────────────────────────────────────
  const handleDeleteCliente = (id: number) => {
    const found = clientes.find((c) => c.id === id) || null;
    setSelectedCliente(found);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCliente) return;
    try {
      await deleteCliente(selectedCliente.id);
      toast.success("Cliente eliminado con éxito.");
      fetchClientes(page, search); // recargar la lista en la misma página
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Ocurrió un error al eliminar el cliente.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedCliente(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Ver detalles
  // ─────────────────────────────────────────────────────────
  const handleViewDetails = (id: number) => {
    const found = clientes.find((c) => c.id === id) || null;
    setSelectedCliente(found);
    setIsDetailsOpen(true);
  };

  // ─────────────────────────────────────────────────────────
  // Editar
  // ─────────────────────────────────────────────────────────
  const handleEdit = (id: number) => {
    const found = clientes.find((c) => c.id === id) || null;
    setSelectedCliente(found);
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
    setSelectedCliente(null);
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-2 bg-blue-500 text-white rounded flex items-center"
        >
          <FaPlus className="mr-2" />
          Agregar Cliente
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {clientes.length === 0 ? (
            <div className="text-center mt-4">No hay resultados</div>
          ) : (
            <ClientesTable
              clientes={clientes}
              onDelete={handleDeleteCliente}
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
              className="page-btn"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal Crear Cliente */}
      <ClienteForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          // recarga la lista
          fetchClientes(page, search);
        }}
      />

      {/* Modal Detalles */}
      <ClienteDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        cliente={selectedCliente}
        onEdit={(clienteId) => {
          setIsDetailsOpen(false);
          handleEdit(clienteId);
        }}
      />

      {/* Modal Editar */}
      <ClienteForm
        isOpen={isEditOpen}
        cliente={selectedCliente} // pasa el cliente seleccionado
        onClose={closeModals}
        onSuccess={() => {
          fetchClientes(page, search);
          closeModals();
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedCliente
            ? `¿Estás seguro de eliminar al cliente "${selectedCliente.nombre_razon_social}"?`
            : "¿Estás seguro de eliminar este cliente?"
        }
      />
    </div>
  );
};

export default ClientesPage;
