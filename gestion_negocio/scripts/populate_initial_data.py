"""
Script para asegurar que ciertos datos mínimos existan en la BD:
- Plan "Lite"
- Roles (SuperAdmin, Admin, Empleado)
- Organización principal (y su Plan, si procede)
- Sucursal principal, Bodega principal, Centro de costos principal, Caja principal
"""

from database import SessionLocal
from models.planes import Plan
from models.roles import Rol
from models.organizaciones import Organizacion, EstadoOrganizacion, Sucursal, Bodega, CentroCosto, Caja
from datetime import datetime, timedelta

# Ajusta estos imports a tu estructura
# from models.catalogos import ...
# from services.dv_calculator import ...

# Roles (ID)
ROLE_SUPERADMIN = 1
ROLE_ADMIN = 2
ROLE_EMPLEADO = 3

def main():
    db = SessionLocal()

    # 1) Asegurar plan "Lite"
    plan_lite = db.query(Plan).filter(Plan.nombre_plan == "Plan Lite").first()
    if not plan_lite:
        # insert new plan
        plan_lite = Plan(
            # Ajusta más campos si tus planes los tienen, p.e.:
            # id=1, # si tu PK es autoincrement, no es necesario
            nombre_plan="Plan Lite",
            max_usuarios=2,  # tu ejemplo
            precio=90000,    # COP
            # max_empleados=8, 
            # max_sucursales=1,
            # uso_ilimitado_funciones=True,
            # soporte_prioritario=False,
            fecha_creacion=datetime.utcnow()
        )
        db.add(plan_lite)
        print("✅ Plan Lite creado en la BD")
    else:
        print("🔎 Plan Lite ya existe en la BD")

    db.commit()
    db.refresh(plan_lite)

    # 2) Asegurar Roles (SuperAdmin, Admin, Empleado)
    #    si usas un ID autoincrement, no fuerces el ID, crea por nombre
    #    si usas IDs fijos, puedes forzarlos
    for (role_id, role_nombre) in [(ROLE_SUPERADMIN, "SuperAdmin"), (ROLE_ADMIN, "Admin"), (ROLE_EMPLEADO, "Empleado")]:
        rol_obj = db.query(Rol).filter(Rol.id == role_id).first()
        if not rol_obj:
            rol_obj = Rol(
                id=role_id, 
                nombre=role_nombre, 
                descripcion=f"Rol {role_nombre}",
            )
            db.add(rol_obj)
            print(f"✅ Rol {role_nombre} insertado con ID={role_id}")
        else:
            print(f"🔎 Rol {role_nombre} (ID={role_id}) ya existe")
    db.commit()

    # 3) Asegurar Organización principal
    #    Por ejemplo, decidimos que la principal tenga ID=1
    org_principal = db.query(Organizacion).filter(Organizacion.id == 1).first()
    if not org_principal:
        # Crea la org con Plan Lite (ID=plan_lite.id)
        fecha_inicio = datetime.utcnow()
        fecha_fin = fecha_inicio + timedelta(days=15)
        org_principal = Organizacion(
            id=1,  # si tu PK es autoincrement, omite
            tipo_documento_id=2,   # NIT?
            numero_documento="900000001",  # Ajusta
            dv="9",
            nombre_fiscal="ORGANIZACION PRINCIPAL",
            nombre_comercial="ORG PRIN",
            nombre_corto="ORG1",
            obligado_contabilidad=False,
            email_principal="orgprin@example.com",
            # ... resto de campos ...
            estado=EstadoOrganizacion.activo,
            plan_id=plan_lite.id,
            fecha_inicio_plan=fecha_inicio,
            fecha_fin_plan=fecha_fin,
            trial_activo=True
        )
        db.add(org_principal)
        db.commit()
        db.refresh(org_principal)
        print("✅ Organización principal creada")
    else:
        print(f"🔎 Organización principal (ID=1) ya existe")

    # 4) Sucursal principal
    #    Ajusta tu model Sucursal => organizacion_id, nombre, etc.
    suc_prin = db.query(Sucursal).filter(Sucursal.organizacion_id == org_principal.id, Sucursal.sucursal_principal == True).first()
    if not suc_prin:
        suc_prin = Sucursal(
            organizacion_id=org_principal.id,
            nombre="Principal",
            pais="COLOMBIA",
            # ...
            sucursal_principal=True,
            activa=True
        )
        db.add(suc_prin)
        db.commit()
        db.refresh(suc_prin)
        print("✅ Sucursal principal creada")
    else:
        print("🔎 Sucursal principal ya existe")

    # 5) Bodega principal
    bodega_prin = db.query(Bodega).filter(Bodega.organizacion_id == org_principal.id, Bodega.bodega_por_defecto == True).first()
    if not bodega_prin:
        bodega_prin = Bodega(
            organizacion_id=org_principal.id,
            sucursal_id=suc_prin.id,  # referencia a la sucursal
            nombre="Bodega Principal",
            bodega_por_defecto=True,
            estado=True
        )
        db.add(bodega_prin)
        db.commit()
        db.refresh(bodega_prin)
        print("✅ Bodega principal creada")
    else:
        print("🔎 Bodega principal ya existe")

    # 6) Centro de costos principal
    cc_prin = db.query(CentroCosto).filter(CentroCosto.organizacion_id == org_principal.id, CentroCosto.codigo == "CC-PRINC").first()
    if not cc_prin:
        cc_prin = CentroCosto(
            organizacion_id=org_principal.id,
            codigo="CC-PRINC",
            nombre="Centro de Costos Principal",
            nivel="PRINCIPAL",
            estado=True
        )
        db.add(cc_prin)
        db.commit()
        db.refresh(cc_prin)
        print("✅ Centro de Costos principal creado")
    else:
        print("🔎 Centro de Costos principal ya existe")

    # 7) Caja principal
    caja_prin = db.query(Caja).filter(Caja.organizacion_id == org_principal.id, Caja.nombre == "Caja Principal").first()
    if not caja_prin:
        caja_prin = Caja(
            organizacion_id=org_principal.id,
            nombre="Caja Principal",
            sucursal_id=suc_prin.id,
            estado=True,
            vigencia=True
        )
        db.add(caja_prin)
        db.commit()
        db.refresh(caja_prin)
        print("✅ Caja principal creada")
    else:
        print("🔎 Caja principal ya existe")

    db.close()
    print("🚀 ¡Datos iniciales verificados/creados con éxito!")

if __name__ == "__main__":
    main()
