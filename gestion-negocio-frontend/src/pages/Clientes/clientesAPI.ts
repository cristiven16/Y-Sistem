import axios from "axios";
import { Cliente } from "./clientesTypes";

const API_URL = "http://localhost:8000/clientes"; // Ajustar según la API

export const getClientes = async (): Promise<Cliente[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const deleteCliente = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};

export const crearCliente = async (cliente: any) => {
    await axios.post(API_URL, cliente);
  };