// src/pages/SuperAdmin/Planes/PlanesTypes.ts

/**
 * Interfaz que representa cómo el backend describe un Plan
 * (similar a `PlanRead` en tu `plan_schemas.py`).
 */
export interface Plan {
  id: number;
  nombre_plan: string;
  max_usuarios: number;
  max_empleados?: number;
  max_sucursales?: number;
  precio?: number | null;
  soporte_prioritario?: boolean;
  uso_ilimitado_funciones?: boolean;
  duracion_dias?: number | null;
}

/**
 * Interfaz para el payload que envías al crear/actualizar un Plan.
 * (similar a PlanCreate en el backend)
 */
export interface PlanPayload {
  nombre_plan: string;
  max_usuarios: number;
  max_empleados?: number;
  max_sucursales?: number;
  precio?: number | null;
  soporte_prioritario?: boolean;
  uso_ilimitado_funciones?: boolean;
  duracion_dias?: number | null;
}
