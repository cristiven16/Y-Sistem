// src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute"; 
import { ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_EMPLEADO } from "../utils/roles";

// Páginas
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import OrganizationsPage from "../pages/Organizations/OrganizationsPage";
import EmpresaAjustesPage from "../pages/Organizations/EmpresaAjustesPage"; // <-- Importar tu nuevo componente
import ClientesPage from "../pages/Clientes/ClientesPage";
import ProveedoresPage from "../pages/Proveedores/ProveedoresPage";
import EmpleadosPage from "../pages/Empleados/EmpleadosPage";
import PlanesPage from "../pages/SuperAdmin/Planes/PlanesPage";
import SucursalesPage from "../pages/Sucursales/SucursalesPage";
import BodegasPage from "../pages/Bodegas/BodegasPage";
import CajasPage from "../pages/Cajas/CajasPage";
import CentrosCostosPage from "../pages/CentroCostos/CentrosCostosPage";
import NumTransaccionesPage from "../pages/NumeracionTransaccion/NumTransaccionesPage";
import TiendasVirtualesPage from "../pages/TiendasVirtuales/TiendasVirtualesPage";
import UsuariosPage from "../pages/Usuarios/UsuariosPage";
import RolesPage from "../pages/Roles/RolesPage";
import PermissionsPage from "../pages/Permissions/PermissionsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública de Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      {/* Clientes */}
      <Route
        path="/clientes"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_EMPLEADO]}>
            <ClientesPage />
          </ProtectedRoute>
        }
      />
      {/* Proveedores */}
      <Route
        path="/proveedores"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_EMPLEADO]}>
            <ProveedoresPage />
          </ProtectedRoute>
        }
      />
      {/* Empleados */}
      <Route
        path="/empleados"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <EmpleadosPage />
          </ProtectedRoute>
        }
      />

      {/* Lista de Organizaciones => Admin / Superadmin */}
      <Route
        path="/organizations"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <OrganizationsPage />
          </ProtectedRoute>
        }
      />

      {/* Ajustes de la Empresa => /organizations/:orgId/ajustes */}
      <Route
        path="/organizations/:orgId/ajustes"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <EmpresaAjustesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sucursales"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <SucursalesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tiendas-virtuales"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <TiendasVirtualesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bodegas"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <BodegasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cajas"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <CajasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/centros-costos"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <CentrosCostosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/numeraciones"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <NumTransaccionesPage />
          </ProtectedRoute>
        }
      />


      {/* Planes => solo Superadmin */}
      <Route
        path="/plans"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN]}>
            <PlanesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permisos"
        element={
          <ProtectedRoute allowedRoles={[ROLE_SUPERADMIN, ROLE_ADMIN]}>
            <PermissionsPage />
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz */}
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
