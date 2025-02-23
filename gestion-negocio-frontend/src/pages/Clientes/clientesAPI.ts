import axios from "axios";
import { Cliente } from "./clientesTypes";

const API_URL = "http://localhost:8000"; // Ajustar según la API

export const getClientes = async (search: string = ""): Promise<Cliente[]> => {
    try {
        const response = await axios.get(`${API_URL}/clientes`, {
            params: { search },
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return [];
    }
};

export const deleteCliente = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/clientes/${id}`);
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        throw error;
    }
};

export const crearCliente = async (cliente: Cliente) => {
    try {
        await axios.post(`${API_URL}/clientes`, cliente);
    } catch (error) {
        console.error("Error al crear cliente:", error);
        throw error;
    }
};

export const obtenerTiposDocumento = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/catalogos/tipos-documento`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener tipos de documento:", error);
        return [];
    }
};

export const obtenerRegimenesTributarios = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/catalogos/regimenes-tributarios`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener regímenes tributarios:", error);
        return [];
    }
};

export const obtenerTiposPersona = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/catalogos/tipos-persona`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener tipos de persona:", error);
        return [];
    }
};
