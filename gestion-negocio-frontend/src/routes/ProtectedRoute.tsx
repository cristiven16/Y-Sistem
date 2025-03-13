// src/routes/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];  // si usas rol-based
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // OBTENEMOS isLoading (antes se llamaba loading)
  const { user, isLoading } = useAuth();

  console.log("ProtectedRoute => isLoading:", isLoading, " user:", user);

  // 1) Mientras se verifica el token => spinner o mensaje
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // 2) Si NO hay user => /login
  if (!user) {
    console.log("ProtectedRoute => no user => go /login");
    return <Navigate to="/login" replace />;
  }

  // 3) Rol-based check (opcional)
  if (allowedRoles && !allowedRoles.includes(user.rol_id)) {
    console.log("ProtectedRoute => rol no permitido => /forbidden");
    return <Navigate to="/forbidden" replace />;
  }

  // 4) OK => render children
  console.log("ProtectedRoute => OK => render children");
  return children;
}
