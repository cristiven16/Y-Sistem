import axios from "axios";
import { Cliente } from "./clientesTypes";

const API_URL = "http://localhost:8000"; // Ajustar según la API

export const getClientes = async (): Promise<Cliente> => {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
};

export const deleteCliente = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/clientes/${id}`);
};

export const crearCliente = async (cliente: any) => {
    await axios.post(`${API_URL}/clientes`, cliente);
};

export const obtenerTiposDocumento = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/tipos-documento`);
    return await response.json();
};

export const obtenerRegimenesTributarios = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/regimenes-tributarios`);
    return await response.json();
};

export const obtenerTiposPersona = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/tipos-persona`);
    return await response.json();
};

export const obtenerMonedas = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/monedas`);
    return await response.json();
};

export const obtenerTarifasPrecios = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/tarifas-precios`);
    return await response.json();
};

export const obtenerActividadesEconomicas = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/actividades-economicas`);
    return await response.json();
};

export const obtenerFormasPago = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/formas-pago`);
    return await response.json();
};

export const obtenerRetenciones = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/retenciones`);
    return await response.json();
};

export const obtenerTiposMarketing = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/tipos-marketing`);
    return await response.json();
};

export const obtenerSucursales = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/sucursales`);
    return await response.json();
};

export const obtenerRutasLogisticas = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/rutas-logisticas`);
    return await response.json();
};

export const obtenerVendedores = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/catalogos/vendedores`);
    return await response.json();
};


export const obtenerDepartamentos = async (): Promise<any> => {
    const response = await fetch(`${API_URL}/departamentos`); // Ajusta la ruta si es necesario
    return await response.json();
};

export const obtenerCiudades = async (departamentoId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/ciudades?departamento_id=${departamentoId}`); // Ajusta la ruta si es necesario
    return await response.json();
};

export const actualizarCliente = async (clienteId: number, cliente: any) => {
    try {
        const response = await axios.put(`${API_URL}/${clienteId}`, cliente);
        return response.data;
    } catch (error: any) {
        console.error("Error al actualizar el cliente:", error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el componente que llama a la función
    }
};