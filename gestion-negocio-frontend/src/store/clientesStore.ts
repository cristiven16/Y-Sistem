// src/store/clientesStore.ts

import { create } from "zustand";
import { getClientes } from "../api/clientesAPI";
import { ClienteResponse } from "../pages/Clientes/clientesTypes";

interface ClientesState {
  clientes: ClienteResponse[];
  search: string;
  paginaActual: number;
  totalPaginas: number;
  pageSize: number;

  setSearch: (search: string) => void;
  setPaginaActual: (pagina: number) => void;
  fetchClientes: () => Promise<void>;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  search: "",
  paginaActual: 1,
  totalPaginas: 1,
  pageSize: 10,

  setSearch: (search: string) => {
    set({ search, paginaActual: 1 }); 
    // Luego al cambiar search, queremos recargar desde la pag 1
    get().fetchClientes();
  },

  setPaginaActual: (pagina: number) => {
    set({ paginaActual: pagina });
    get().fetchClientes();
  },

  fetchClientes: async () => {
    const { search, paginaActual, pageSize } = get();
    try {
      // Llamamos al backend con la paginación
      const data = await getClientes(search, paginaActual, pageSize);
      set({
        clientes: data.data,
        totalPaginas: data.total_paginas,
      });
    } catch (err) {
      console.error("Error al fetchClientes:", err);
    }
  },
}));
