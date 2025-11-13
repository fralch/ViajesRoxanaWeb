# API Gimnasio - Documentación

## Información General

Base URL: `/api/v1/endpoint/gimnasio`

Todas las rutas del gimnasio son **públicas** (no requieren autenticación).

---

## Miembros

### 1. Listar Miembros
**GET** `/api/v1/endpoint/gimnasio/miembros`

Lista todos los miembros del gimnasio con opción de búsqueda.

**Query Parameters:**
- `search` (opcional): Busca por nombre o DNI

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/miembros
GET /api/v1/endpoint/gimnasio/miembros?search=Juan
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "dni": "12345678",
      "fecha_nacimiento": "1990-01-15",
      "genero": "M",
      "foto_perfil": null,
      "estado": "Activo",
      "fecha_registro": "2025-01-01"
    }
  ]
}
```

---

### 2. Crear Miembro
**POST** `/api/v1/endpoint/gimnasio/miembros`

Crea un nuevo miembro del gimnasio.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "fecha_nacimiento": "1990-01-15",
  "genero": "M",
  "foto_perfil": null,
  "estado": "Activo",
  "fecha_registro": "2025-01-01"
}
```

**Validaciones:**
- `nombre`: requerido, string, máximo 255 caracteres
- `dni`: requerido, string, máximo 50 caracteres
- `fecha_nacimiento`: requerido, formato fecha (YYYY-MM-DD)
- `genero`: requerido, string, máximo 50 caracteres
- `foto_perfil`: opcional, string, máximo 1024 caracteres
- `estado`: requerido, string, máximo 50 caracteres
- `fecha_registro`: requerido, formato fecha (YYYY-MM-DD)

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "dni": "12345678",
    "fecha_nacimiento": "1990-01-15",
    "genero": "M",
    "foto_perfil": null,
    "estado": "Activo",
    "fecha_registro": "2025-01-01"
  }
}
```

---

### 3. Ver Miembro
**GET** `/api/v1/endpoint/gimnasio/miembros/{id}`

Obtiene los detalles de un miembro específico incluyendo sus relaciones (membresías, asistencias, metas).

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/miembros/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "dni": "12345678",
    "fecha_nacimiento": "1990-01-15",
    "genero": "M",
    "foto_perfil": null,
    "estado": "Activo",
    "fecha_registro": "2025-01-01",
    "membresias": [...],
    "asistencias": [...],
    "metas": [...]
  }
}
```

---

### 4. Actualizar Miembro
**PUT/PATCH** `/api/v1/endpoint/gimnasio/miembros/{id}`

Actualiza los datos de un miembro existente.

**Request Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "estado": "Inactivo"
}
```

**Validaciones:**
- Todos los campos son opcionales (`sometimes|required`)
- Mismas reglas que en crear miembro

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Juan Carlos Pérez",
    "dni": "12345678",
    "fecha_nacimiento": "1990-01-15",
    "genero": "M",
    "foto_perfil": null,
    "estado": "Inactivo",
    "fecha_registro": "2025-01-01"
  }
}
```

---

### 5. Eliminar Miembro
**DELETE** `/api/v1/endpoint/gimnasio/miembros/{id}`

Elimina un miembro del gimnasio.

**Ejemplo Request:**
```bash
DELETE /api/v1/endpoint/gimnasio/miembros/1
```

**Respuesta (200):**
```json
{
  "success": true
}
```

---

### 6. Actualizar Foto de Perfil
**POST** `/api/v1/endpoint/gimnasio/miembros/{id}/foto-perfil`

Actualiza la foto de perfil de un miembro y mantiene un historial de todas las fotos anteriores.

**Parámetros de URL:**
- `id`: ID del miembro (id_usuario)

**Request Body:**
- Content-Type: `multipart/form-data`
- Campo: `foto` (archivo de imagen)

**Validaciones:**
- `foto`: requerido, debe ser una imagen (jpeg, png, jpg, gif)
- Tamaño máximo: 5MB

**Ejemplo Request:**
```bash
curl -X POST http://localhost/api/v1/endpoint/gimnasio/miembros/1/foto-perfil \
  -F "foto=@/ruta/a/imagen.jpg"
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Foto de perfil actualizada exitosamente",
  "data": {
    "foto_perfil": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699999999.jpg",
    "historial": [
      {
        "url": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699888888.jpg",
        "fecha_cambio": "2025-11-13 15:30:00"
      },
      {
        "url": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699777777.jpg",
        "fecha_cambio": "2025-11-10 10:15:00"
      }
    ]
  }
}
```

**Respuesta - Primera foto (sin historial previo) (200):**
```json
{
  "success": true,
  "mensaje": "Foto de perfil actualizada exitosamente",
  "data": {
    "foto_perfil": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699999999.jpg",
    "historial": []
  }
}
```

**Respuesta - Miembro no encontrado (404):**
```json
{
  "message": "No query results for model [App\\Models\\Gimnasio\\GMiembro] {id}"
}
```

**Respuesta - Validación fallida (422):**
```json
{
  "message": "The foto field is required.",
  "errors": {
    "foto": [
      "The foto field is required."
    ]
  }
}
```

**Notas:**
- Cada vez que se actualiza la foto, la foto anterior se guarda en el historial con la fecha y hora del cambio
- El campo `historial_fotos` se almacena como JSON en la base de datos
- Las fotos se guardan en `storage/gimnasio/fotos_perfil/`
- El nombre del archivo incluye el ID del usuario y un timestamp único

---

## Membresías

### 1. Listar Membresías
**GET** `/api/v1/endpoint/gimnasio/membresias`

Lista todas las membresías con opciones de filtrado.

**Query Parameters:**
- `id_usuario` (opcional): Filtra por usuario específico
- `estado` (opcional): Filtra por estado (Activa, Inactiva, etc.)

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/membresias
GET /api/v1/endpoint/gimnasio/membresias?id_usuario=1
GET /api/v1/endpoint/gimnasio/membresias?estado=Activa
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_membresia": 1,
      "id_usuario": 1,
      "tipo_plan": "Mensual",
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-01-31",
      "estado": "Activa"
    }
  ]
}
```

---

### 2. Crear Membresía
**POST** `/api/v1/endpoint/gimnasio/membresias`

Crea una nueva membresía para un miembro.

**Request Body:**
```json
{
  "id_usuario": 1,
  "tipo_plan": "Mensual",
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-01-31",
  "estado": "Activa"
}
```

**Validaciones:**
- `id_usuario`: requerido, integer, debe existir en tabla `g_miembros`
- `tipo_plan`: requerido, string, máximo 100 caracteres
- `fecha_inicio`: requerido, formato fecha (YYYY-MM-DD)
- `fecha_fin`: requerido, formato fecha, debe ser mayor o igual a `fecha_inicio`
- `estado`: requerido, string, máximo 50 caracteres

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id_membresia": 1,
    "id_usuario": 1,
    "tipo_plan": "Mensual",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-31",
    "estado": "Activa"
  }
}
```

---

### 3. Ver Membresía
**GET** `/api/v1/endpoint/gimnasio/membresias/{id}`

Obtiene los detalles de una membresía específica.

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/membresias/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_membresia": 1,
    "id_usuario": 1,
    "tipo_plan": "Mensual",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-31",
    "estado": "Activa"
  }
}
```

---

### 4. Actualizar Membresía
**PUT/PATCH** `/api/v1/endpoint/gimnasio/membresias/{id}`

Actualiza una membresía existente.

**Request Body:**
```json
{
  "fecha_fin": "2025-02-28",
  "estado": "Activa"
}
```

**Validaciones:**
- Todos los campos son opcionales (`sometimes|required`)
- Mismas reglas que en crear membresía

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_membresia": 1,
    "id_usuario": 1,
    "tipo_plan": "Mensual",
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-02-28",
    "estado": "Activa"
  }
}
```

---

### 5. Eliminar Membresía
**DELETE** `/api/v1/endpoint/gimnasio/membresias/{id}`

Elimina una membresía.

**Ejemplo Request:**
```bash
DELETE /api/v1/endpoint/gimnasio/membresias/1
```

**Respuesta (200):**
```json
{
  "success": true
}
```

---

## Asistencias

### 1. Listar Asistencias
**GET** `/api/v1/endpoint/gimnasio/asistencias`

Lista todas las asistencias con opciones de filtrado.

**Query Parameters:**
- `dni` (opcional): Filtra por DNI del miembro
- `fecha_asistencia` (opcional): Filtra por fecha específica (YYYY-MM-DD)

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/asistencias
GET /api/v1/endpoint/gimnasio/asistencias?dni=12345678
GET /api/v1/endpoint/gimnasio/asistencias?fecha_asistencia=2025-01-15
GET /api/v1/endpoint/gimnasio/asistencias?dni=12345678&fecha_asistencia=2025-01-15
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_asistencia": 1,
      "id_usuario": 1,
      "fecha_asistencia": "2025-01-15",
      "hora_entrada": "08:30:00"
    }
  ]
}
```

**Respuesta - DNI no encontrado (404):**
```json
{
  "success": false,
  "error": "Miembro no encontrado"
}
```

---

### 2. Crear Asistencia
**POST** `/api/v1/endpoint/gimnasio/asistencias`

Crea un registro de asistencia manualmente.

**Request Body:**
```json
{
  "id_usuario": 1,
  "fecha_asistencia": "2025-01-15",
  "hora_entrada": "08:30:00"
}
```

**Validaciones:**
- `id_usuario`: requerido, integer, debe existir en tabla `g_miembros`
- `fecha_asistencia`: requerido, formato fecha (YYYY-MM-DD)
- `hora_entrada`: requerido, formato hora (HH:mm:ss)

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id_asistencia": 1,
    "id_usuario": 1,
    "fecha_asistencia": "2025-01-15",
    "hora_entrada": "08:30:00"
  }
}
```

---

### 3. Ver Asistencia
**GET** `/api/v1/endpoint/gimnasio/asistencias/{id}`

Obtiene los detalles de una asistencia específica.

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/asistencias/1
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_asistencia": 1,
    "id_usuario": 1,
    "fecha_asistencia": "2025-01-15",
    "hora_entrada": "08:30:00"
  }
}
```

---

### 4. Actualizar Asistencia
**PUT/PATCH** `/api/v1/endpoint/gimnasio/asistencias/{id}`

Actualiza un registro de asistencia.

**Request Body:**
```json
{
  "hora_entrada": "09:00:00"
}
```

**Validaciones:**
- Todos los campos son opcionales (`sometimes|required`)
- Mismas reglas que en crear asistencia

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id_asistencia": 1,
    "id_usuario": 1,
    "fecha_asistencia": "2025-01-15",
    "hora_entrada": "09:00:00"
  }
}
```

---

### 5. Eliminar Asistencia
**DELETE** `/api/v1/endpoint/gimnasio/asistencias/{id}`

Elimina un registro de asistencia.

**Ejemplo Request:**
```bash
DELETE /api/v1/endpoint/gimnasio/asistencias/1
```

**Respuesta (200):**
```json
{
  "success": true
}
```

---

## Check-in (Verificar Membresía y Marcar Asistencia)

### Verificar Membresía y Registrar Asistencia
**GET** `/api/v1/endpoint/gimnasio/verificar-membresia/{dni}`

Verifica la membresía de un miembro usando su DNI y registra automáticamente su asistencia si todo es válido.

**Parámetros de URL:**
- `dni`: DNI del miembro (8 dígitos)

**Ejemplo Request:**
```bash
GET /api/v1/endpoint/gimnasio/verificar-membresia/12345678
```

**Validaciones automáticas:**
1. Verifica que el miembro exista (busca por DNI)
2. Verifica que tenga una membresía con estado "Activa"
3. Verifica que la fecha actual esté dentro del rango: `fecha_inicio <= hoy <= fecha_fin`
4. Verifica que no haya registrado asistencia el día de hoy

**Respuesta exitosa - Primera asistencia del día (200):**
```json
{
  "mensaje": "Asistencia registrada exitosamente",
  "nombre": "Juan Pérez",
  "hora": "08:30:45",
  "foto_perfil": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699999999.jpg"
}
```

**Respuesta exitosa - Sin foto de perfil (200):**
```json
{
  "mensaje": "Asistencia registrada exitosamente",
  "nombre": "Juan Pérez",
  "hora": "08:30:45"
}
```

**Respuesta - Ya registrado hoy con foto (200):**
```json
{
  "mensaje": "Ya registrado hoy",
  "nombre": "Juan Pérez",
  "hora": "08:30:00",
  "foto_perfil": "http://localhost/storage/gimnasio/fotos_perfil/miembro_1_1699999999.jpg"
}
```

**Respuesta - Ya registrado hoy sin foto (200):**
```json
{
  "mensaje": "Ya registrado hoy",
  "nombre": "Juan Pérez",
  "hora": "08:30:00"
}
```

**Respuesta - Miembro no encontrado (404):**
```json
{
  "error": "Miembro no encontrado"
}
```

**Respuesta - Usuario sin membresía (404):**
```json
{
  "error": "Usuario sin membresía",
  "mensaje": "El usuario no tiene ninguna membresía registrada"
}
```

**Respuesta - Membresía vencida (403):**
```json
{
  "error": "Membresía vencida",
  "mensaje": "La membresía del usuario ha expirado",
  "fecha_vencimiento": "2025-01-15"
}
```

**Respuesta - Membresía inactiva (403):**
```json
{
  "error": "Membresía inactiva",
  "mensaje": "La membresía del usuario no está activa o está fuera del rango de fechas"
}
```

**Diferenciación de errores de membresía:**
- **Usuario sin membresía (404)**: El usuario existe pero nunca ha tenido una membresía registrada
- **Membresía vencida (403)**: El usuario tiene membresías pero han expirado (fecha_fin < hoy)
- **Membresía inactiva (403)**: La membresía existe pero:
  - Estado diferente a "Activa"
  - Fecha actual antes de `fecha_inicio`
  - Está dentro del rango pero no tiene estado "Activa"

**Notas:**
- El campo `foto_perfil` solo se incluye en la respuesta si el usuario ha subido una foto
- La URL de la foto es completa y accesible directamente desde el navegador

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Solicitud exitosa |
| 201 | Recurso creado exitosamente |
| 403 | Acceso prohibido (membresía inválida) |
| 404 | Recurso no encontrado |
| 422 | Error de validación |
| 500 | Error interno del servidor |

---

## Notas Importantes

1. **Autenticación**: Ninguna ruta del gimnasio requiere autenticación
2. **Formato de fechas**: Todas las fechas deben enviarse en formato `YYYY-MM-DD`
3. **Formato de horas**: Todas las horas deben enviarse en formato `HH:mm:ss` (24 horas)
4. **IDs**: Los IDs son autoincrementales y se generan automáticamente
5. **Relaciones**:
   - Un miembro puede tener múltiples membresías
   - Un miembro puede tener múltiples asistencias
   - Un miembro puede tener múltiples metas
6. **Check-in**: La ruta de verificar membresía es la forma recomendada de registrar asistencias ya que valida todo automáticamente
7. **Fotos de perfil**:
   - Las fotos se almacenan en `storage/gimnasio/fotos_perfil/`
   - Cada cambio de foto guarda la anterior en el historial
   - El historial incluye la ruta y fecha/hora del cambio
   - Tamaño máximo por foto: 5MB
   - Formatos aceptados: jpeg, png, jpg, gif
   - Las fotos son accesibles vía URL pública: `http://dominio/storage/ruta/archivo.jpg`
8. **Historial de fotos**:
   - Se almacena como JSON en el campo `historial_fotos`
   - Cada entrada contiene: `ruta` y `fecha_cambio`
   - El historial crece cada vez que se actualiza la foto
   - La foto actual NO está en el historial, solo las anteriores

---

## Ejemplos de Flujo Completo

### Registrar un nuevo miembro y su membresía

```bash
# 1. Crear el miembro
POST /api/v1/endpoint/gimnasio/miembros
{
  "nombre": "María González",
  "dni": "87654321",
  "fecha_nacimiento": "1995-05-20",
  "genero": "F",
  "estado": "Activo",
  "fecha_registro": "2025-01-15"
}

# Respuesta: id_usuario = 5

# 2. Crear su membresía
POST /api/v1/endpoint/gimnasio/membresias
{
  "id_usuario": 5,
  "tipo_plan": "Mensual",
  "fecha_inicio": "2025-01-15",
  "fecha_fin": "2025-02-14",
  "estado": "Activa"
}

# 3. Registrar asistencia mediante DNI
GET /api/v1/endpoint/gimnasio/verificar-membresia/87654321
```

### Consultar historial de asistencias de un miembro

```bash
# Obtener todas las asistencias del miembro con DNI 87654321
GET /api/v1/endpoint/gimnasio/asistencias?dni=87654321

# Obtener asistencias de una fecha específica para ese miembro
GET /api/v1/endpoint/gimnasio/asistencias?dni=87654321&fecha_asistencia=2025-01-15
```

### Verificar membresías activas

```bash
# Listar todas las membresías activas
GET /api/v1/endpoint/gimnasio/membresias?estado=Activa
```

### Actualizar foto de perfil y ver historial

```bash
# 1. Subir la primera foto de perfil
curl -X POST http://localhost/api/v1/endpoint/gimnasio/miembros/5/foto-perfil \
  -F "foto=@/ruta/a/foto1.jpg"

# Respuesta: foto_perfil actualizada, historial = []

# 2. Cambiar la foto de perfil (la primera foto se guarda en el historial)
curl -X POST http://localhost/api/v1/endpoint/gimnasio/miembros/5/foto-perfil \
  -F "foto=@/ruta/a/foto2.jpg"

# Respuesta: foto_perfil = foto2.jpg, historial = [foto1.jpg con su fecha]

# 3. Cambiar nuevamente la foto
curl -X POST http://localhost/api/v1/endpoint/gimnasio/miembros/5/foto-perfil \
  -F "foto=@/ruta/a/foto3.jpg"

# Respuesta: foto_perfil = foto3.jpg, historial = [foto1.jpg, foto2.jpg con sus fechas]

# 4. Verificar check-in (incluye la foto actual)
GET /api/v1/endpoint/gimnasio/verificar-membresia/87654321
# Respuesta incluirá el campo foto_perfil con la URL de foto3.jpg
```

---

## Información de Contacto y Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.
