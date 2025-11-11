# API Gimnasio v1

Grupo de endpoints sin autenticación para gestión de miembros, membresías, asistencias y check-in por QR.

- Base URL: `/api/v1/endpoint/gimnasio`
- Autenticación: no requerida (no usar headers `Authorization`)
- Formato: JSON

## Miembros

Recurso: `miembros`

### Listar miembros
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/miembros`
- Query params:
  - `search` (opcional): filtra por `nombre` o `dni` (like)
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id_usuario": 1,
      "nombre": "Juan Perez",
      "dni": "12345678",
      "fecha_nacimiento": "1990-01-01",
      "genero": "M",
      "foto_perfil": null,
      "estado": "Activo",
      "fecha_registro": "2025-11-01"
    }
  ]
}
```

### Crear miembro
- Método: `POST`
- Path: `/api/v1/endpoint/gimnasio/miembros`
- Body requerido:
```json
{
  "nombre": "Juan Perez",
  "dni": "12345678",
  "fecha_nacimiento": "1990-01-01",
  "genero": "M",
  "foto_perfil": null,
  "estado": "Activo",
  "fecha_registro": "2025-11-01"
}
```
- Validaciones: `string|max`, `date`, `nullable`, etc.
- Respuesta 201:
```json
{ "success": true, "data": { /* miembro creado */ } }
```

### Obtener miembro
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/miembros/{id_usuario}`
- Respuesta 200: incluye relaciones `membresias`, `asistencias`, `metas`.

### Actualizar miembro
- Método: `PUT/PATCH`
- Path: `/api/v1/endpoint/gimnasio/miembros/{id_usuario}`
- Body: mismos campos que `store` pero opcionales (`sometimes|required`).
- Respuesta 200: objeto actualizado.

### Eliminar miembro
- Método: `DELETE`
- Path: `/api/v1/endpoint/gimnasio/miembros/{id_usuario}`
- Respuesta 200: `{ "success": true }`

## Membresías

Recurso: `membresias`

### Listar membresías
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/membresias`
- Query params:
  - `id_usuario` (opcional): filtra por miembro
  - `estado` (opcional): `Activa`/`Inactiva`
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id_membresia": 1,
      "id_usuario": 1,
      "tipo_plan": "Mensual",
      "fecha_inicio": "2025-11-01",
      "fecha_fin": "2025-12-01",
      "estado": "Activa"
    }
  ]
}
```

### Crear membresía
- Método: `POST`
- Path: `/api/v1/endpoint/gimnasio/membresias`
- Body requerido:
```json
{
  "id_usuario": 1,
  "tipo_plan": "Mensual",
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-12-01",
  "estado": "Activa"
}
```
- Validaciones: `exists:g_miembros,id_usuario`, `date`, `after_or_equal:fecha_inicio`.
- Respuesta 201: objeto creado.

### Obtener membresía
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/membresias/{id_membresia}`
- Respuesta 200: objeto encontrado.

### Actualizar membresía
- Método: `PUT/PATCH`
- Path: `/api/v1/endpoint/gimnasio/membresias/{id_membresia}`
- Body: mismos campos de `store` como opcionales.
- Respuesta 200: objeto actualizado.

### Eliminar membresía
- Método: `DELETE`
- Path: `/api/v1/endpoint/gimnasio/membresias/{id_membresia}`
- Respuesta 200: `{ "success": true }`

## Asistencias

Recurso: `asistencias`

### Listar asistencias
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/asistencias`
- Query params:
  - `id_usuario` (opcional)
  - `fecha_asistencia` (opcional, `YYYY-MM-DD`)
- Respuesta 200:
```json
{
  "success": true,
  "data": [
    {
      "id_asistencia": 1,
      "id_usuario": 1,
      "fecha_asistencia": "2025-11-09",
      "hora_entrada": "08:30:00"
    }
  ]
}
```

### Crear asistencia (manual)
- Método: `POST`
- Path: `/api/v1/endpoint/gimnasio/asistencias`
- Body requerido:
```json
{
  "id_usuario": 1,
  "fecha_asistencia": "2025-11-09",
  "hora_entrada": "08:30:00"
}
```
- Validaciones: `exists:g_miembros,id_usuario`, `date`, `date_format:H:i:s`.
- Respuesta 201: objeto creado.

### Obtener asistencia
- Método: `GET`
- Path: `/api/v1/endpoint/gimnasio/asistencias/{id_asistencia}`

### Actualizar asistencia
- Método: `PUT/PATCH`
- Path: `/api/v1/endpoint/gimnasio/asistencias/{id_asistencia}`
- Body: mismos campos de `store` como opcionales.

### Eliminar asistencia
- Método: `DELETE`
- Path: `/api/v1/endpoint/gimnasio/asistencias/{id_asistencia}`

## Check-in por QR (fijo)

Endpoint: `marcar-asistencia`

### Marcar asistencia (QR)
- Método: `POST`
- Path: `/api/v1/endpoint/gimnasio/marcar-asistencia`
- Requiere: `id_usuario` en el body (no se usan tokens)
- Body requerido:
```json
{ "id_usuario": 1, "qr_token": "GYM_TOKEN_2025" }
```
- Flujo y validaciones:
  1. Token QR: compara `qr_token` con `g_configuracion['qr_checkin_token']`; si no coincide → `403 {"error":"QR inválido"}`
  2. Membresía activa: busca `GMembresia` con `estado='Activa'` y `fecha_fin >= hoy`; si no hay → `403 {"error":"Membresía inactiva"}`
  4. Duplicado: si ya existe `g_asistencias` para hoy → `200 {"mensaje":"Ya registrado hoy","hora":"HH:mm:ss"}`
  5. Inserción: crea asistencia y devuelve → `200 {"mensaje":"Asistencia registrada","hora":"HH:mm:ss"}`

- Ejemplo cURL:
```bash
curl -X POST \
  http://localhost/api/v1/endpoint/gimnasio/marcar-asistencia \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"qr_token":"GYM_TOKEN_2025"}'
```

### Configuración del token QR
- Tabla: `g_configuracion` (`clave`= `qr_checkin_token`, `valor`= token actual)
- Actualizar token:
```sql
UPDATE g_configuracion SET valor='NUEVO_TOKEN' WHERE clave='qr_checkin_token';
```

## Códigos de estado y errores
- `200 OK`: lecturas, duplicado de asistencia del día, inserción exitosa en check-in
- `201 Created`: creación de recursos (`miembros`, `membresias`, `asistencias` manuales)
- `401 Unauthorized`: sin autenticación válida (todas las rutas de este grupo)
- `403 Forbidden`: QR inválido o membresía inactiva (check-in)
- `404 Not Found`: recurso no existe en `show/update/destroy`
- `422 Unprocessable Entity`: validación fallida (campos requeridos o formatos)

## Notas de diseño
- Los controladores de recursos devuelven `{ success: true, data: ... }`.
- El check-in devuelve `{ mensaje, hora }` o `{ error }` según caso.
- `id_usuario` empleado en recursos de gimnasio corresponde al miembro en `g_miembros` y se vincula con usuario autenticado por `user()->id` en el check-in.