import { useState } from "react";

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: any) => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, onSave }) => {
  const [cliente, setCliente] = useState({
    tipo_documento_id: 1,
    numero_documento: "",
    nombre_razon_social: "",
    email: "",
    departamento_id: 1,
    ciudad_id: 1,
    direccion: "",
    celular: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cliente);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="modal-header">Nuevo Cliente</h2>
        <form onSubmit={handleSubmit}>
          <label className="label">Nombre o Razón Social</label>
          <input
            type="text"
            name="nombre_razon_social"
            className="input-field"
            value={cliente.nombre_razon_social}
            onChange={handleChange}
            required
          />

          <label className="label">Número de Documento</label>
          <input
            type="text"
            name="numero_documento"
            className="input-field"
            value={cliente.numero_documento}
            onChange={handleChange}
            required
          />

          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input-field"
            value={cliente.email}
            onChange={handleChange}
          />

          <label className="label">Dirección</label>
          <input
            type="text"
            name="direccion"
            className="input-field"
            value={cliente.direccion}
            onChange={handleChange}
            required
          />

          <label className="label">Celular</label>
          <input
            type="text"
            name="celular"
            className="input-field"
            value={cliente.celular}
            onChange={handleChange}
            required
          />

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
