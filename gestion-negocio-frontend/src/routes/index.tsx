import { Route, Routes } from "react-router-dom";
import ClientesPage from "../pages/Clientes/ClientesPage";
import ProveedoresPage from "../pages/Proveedores/ProveedoresPage";
import EmpleadosPage from "../pages/Empleados/EmpleadosPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/clientes" element={<ClientesPage />} />
      <Route path="/proveedores" element={<ProveedoresPage />} />
      <Route path="/empleados" element={<EmpleadosPage />} />
    </Routes>
  );
};

export default AppRoutes;
