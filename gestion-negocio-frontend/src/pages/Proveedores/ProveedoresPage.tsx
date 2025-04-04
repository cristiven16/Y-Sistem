// ProveedoresPage.tsx
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import ProveedoresTable from "./ProveedoresTable";
import ProveedorForm from "./ProveedorForm";
import ProveedorDetailsModal from "../../components/ProveedorDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";


import { ProveedorResponse } from "./proveedoresTypes";

import { getProveedores, deleteProveedor } from "../../api/proveedoresAPI";

const ProveedoresPage: React.FC = () => {

   const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
   const [page, setPage] = useState(1);
   const [totalPaginas, setTotalPaginas] = useState(1);

   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | undefined>();

   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [isConfirmOpen, setIsConfirmOpen] = useState(false);


  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorResponse | undefined>(undefined);

   const fetchProveedores = async (pageNumber: number, searchText: string) => {
     try {
       setLoading(true);
       setError(undefined);
       const resp = await getProveedores(searchText, pageNumber, 10);
       // resp.data debe ser ProveedorResponse[]
       setProveedores(resp.data);
       setPage(resp.page);
       setTotalPaginas(resp.total_paginas);
     } catch (err) {
       console.error(err);
       setError("Error al cargar proveedores");
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     fetchProveedores(1, "");
   }, []);

   useEffect(() => {
     fetchProveedores(1, search);
   }, [search]);

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setSearch(e.target.value);
   };

   const goToPage = (pageNumber: number) => {
     fetchProveedores(pageNumber, search);
   };

   const handleDeleteProveedor = (id: number) => {
     const found = proveedores.find((p) => p.id === id);
     setSelectedProveedor(found); // found es ProveedorResponse | undefined
     setIsConfirmOpen(true);
   };

   const confirmDelete = async () => {
     if (!selectedProveedor) return;
     try {
       await deleteProveedor(selectedProveedor.id);
       toast.success("Proveedor eliminado con éxito.");
       fetchProveedores(page, search);
     } catch (error) {
       console.error("Error al eliminar proveedor:", error);
       toast.error("Ocurrió un error al eliminar el proveedor.");
     } finally {
       setIsConfirmOpen(false);
       setSelectedProveedor(undefined);
     }
   };

   const handleViewDetails = (id: number) => {
     const found = proveedores.find((p) => p.id === id);
     setSelectedProveedor(found);
     setIsDetailsOpen(true);
   };

   const handleEdit = (id: number) => {
     const found = proveedores.find((p) => p.id === id);
     setSelectedProveedor(found);
     setIsEditOpen(true);
   };

   const closeModals = () => {
     setIsCreateOpen(false);
     setIsDetailsOpen(false);
     setIsEditOpen(false);
     setIsConfirmOpen(false);
     setSelectedProveedor(undefined);
   };

   return (
     <div className="container mx-auto p-4">
       <h1 className="text-2xl font-bold mb-4">Proveedores</h1>
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
           <div className="pagination mt-4 flex gap-2">
             {/* Botones paginación */}
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
         proveedor={selectedProveedor}  // ProveedorResponse | undefined
         onEdit={(proveedorId) => {
           setIsDetailsOpen(false);
           handleEdit(proveedorId);
         }}
       />

       {/* Modal Editar Proveedor */}
       <ProveedorForm
         isOpen={isEditOpen}
         proveedor={selectedProveedor}   // ProveedorResponse | undefined
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
