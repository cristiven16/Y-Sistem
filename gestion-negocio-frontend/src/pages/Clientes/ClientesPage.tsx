import { useState, useEffect } from "react";
import ClientesTable from "./ClientesTable";
import ClienteForm from "./ClienteForm";
import { getClientes } from "./clientesAPI";

// Definir el tipo Cliente
interface Cliente {
  id: number;
  tipo_documento_id: number;
  numero_documento: string;
  nombre_razon_social: string;
  email: string;
  departamento_id: number;
  ciudad_id: number;
  direccion: string;
  telefono1?: string;
  telefono2?: string;
  celular?: string;
  whatsapp?: string;
  tipos_persona_id: number;
  regimen_tributario_id: number;
  moneda_principal_id: number;
  tarifa_precios_id: number;
  forma_pago_id: number;
  permitir_venta: boolean;
  descuento?: number;
  cupo_credito?: number;
  sucursal_id: number;
  vendedor_id: number;
  pagina_web?: string;
  actividad_economica_id?: number;
  retencion_id?: number;
  tipo_marketing_id?: number;
  ruta_logistica_id?: number;
  observacion?: string;
}

const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          Nuevo Cliente
        </button>
      </div>

      {/* Tabla de clientes */}
      <ClientesTable clientes={clientes} onEdit={() => {}} onDelete={() => {}} />

      {/* Modal con el formulario */}
      {modalOpen && (
        <ClienteForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={() => {}} />
      )}
    </div>
  );
};

export default ClientesPage;
