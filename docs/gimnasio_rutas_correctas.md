# Rutas Correctas API Gimnasio

Documentación de las rutas correctas para evitar errores 404.

## URL Base
```
http://tu-dominio.com/api/v1/endpoint/gimnasio
```

**IMPORTANTE:** NO incluir `/api/` después de `/endpoint/`
- ✅ Correcto: `/api/v1/endpoint/gimnasio/miembros`
- ❌ Incorrecto: `/api/v1/endpoint/api/gimnasio/miembros`

---

## Autenticación

Las rutas de gimnasio no requieren autenticación.

No envíes el header `Authorization`.

---

## 1. Miembros

### Listar todos los miembros
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/miembros \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Buscar miembros por nombre o DNI
```bash
curl -X GET \
  "http://localhost/api/v1/endpoint/gimnasio/miembros?search=Juan" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Respuesta exitosa (200):**
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

### Crear un nuevo miembro
```bash
curl -X POST \
  http://localhost/api/v1/endpoint/gimnasio/miembros \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Perez",
    "dni": "12345678",
    "fecha_nacimiento": "1990-01-01",
    "genero": "M",
    "estado": "Activo",
    "fecha_registro": "2025-11-01"
  }'
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 1,
    "nombre": "Juan Perez",
    "dni": "12345678",
    "fecha_nacimiento": "1990-01-01",
    "genero": "M",
    "foto_perfil": null,
    "estado": "Activo",
    "fecha_registro": "2025-11-01"
  }
}
```

### Obtener un miembro específico
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/miembros/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Actualizar un miembro
```bash
curl -X PUT \
  http://localhost/api/v1/endpoint/gimnasio/miembros/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos Perez",
    "estado": "Inactivo"
  }'
```

### Eliminar un miembro
```bash
curl -X DELETE \
  http://localhost/api/v1/endpoint/gimnasio/miembros/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

---

## 2. Membresías

### Listar todas las membresías
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/membresias \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Filtrar membresías por usuario
```bash
curl -X GET \
  "http://localhost/api/v1/endpoint/gimnasio/membresias?id_usuario=1" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Filtrar membresías por estado
```bash
curl -X GET \
  "http://localhost/api/v1/endpoint/gimnasio/membresias?estado=Activa" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Respuesta exitosa (200):**
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

### Crear una nueva membresía
```bash
curl -X POST \
  http://localhost/api/v1/endpoint/gimnasio/membresias \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "tipo_plan": "Mensual",
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-12-01",
    "estado": "Activa"
  }'
```

### Obtener una membresía específica
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/membresias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Actualizar una membresía
```bash
curl -X PUT \
  http://localhost/api/v1/endpoint/gimnasio/membresias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Inactiva",
    "fecha_fin": "2025-11-30"
  }'
```

### Eliminar una membresía
```bash
curl -X DELETE \
  http://localhost/api/v1/endpoint/gimnasio/membresias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

---

## 3. Asistencias

### Listar todas las asistencias
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/asistencias \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Filtrar asistencias por usuario
```bash
curl -X GET \
  "http://localhost/api/v1/endpoint/gimnasio/asistencias?id_usuario=1" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Filtrar asistencias por fecha
```bash
curl -X GET \
  "http://localhost/api/v1/endpoint/gimnasio/asistencias?fecha_asistencia=2025-11-09" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

**Respuesta exitosa (200):**
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

### Crear asistencia manual
```bash
curl -X POST \
  http://localhost/api/v1/endpoint/gimnasio/asistencias \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "fecha_asistencia": "2025-11-09",
    "hora_entrada": "08:30:00"
  }'
```

### Obtener una asistencia específica
```bash
curl -X GET \
  http://localhost/api/v1/endpoint/gimnasio/asistencias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

### Actualizar una asistencia
```bash
curl -X PUT \
  http://localhost/api/v1/endpoint/gimnasio/asistencias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "hora_entrada": "09:00:00"
  }'
```

### Eliminar una asistencia
```bash
curl -X DELETE \
  http://localhost/api/v1/endpoint/gimnasio/asistencias/1 \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json"
```

---

## 4. Check-in con QR

### Marcar asistencia con código QR
```bash
curl -X POST \
  http://localhost/api/v1/endpoint/gimnasio/marcar-asistencia \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_token": "GYM_TOKEN_2025"
  }'
```

**Respuesta exitosa - Primera vez del día (200):**
```json
{
  "mensaje": "Asistencia registrada",
  "hora": "08:30:15"
}
```

**Respuesta - Ya registrado hoy (200):**
```json
{
  "mensaje": "Ya registrado hoy",
  "hora": "08:30:15"
}
```

**Errores posibles:**
- **401 Unauthorized:** Token de autenticación inválido o faltante
- **403 Forbidden - QR inválido:**
  ```json
  {
    "error": "QR inválido"
  }
  ```
- **403 Forbidden - Sin membresía:**
  ```json
  {
    "error": "Membresía inactiva"
  }
  ```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa (GET, PUT, DELETE, check-in) |
| 201 | Recurso creado exitosamente (POST) |
| 401 | No autenticado - Token inválido o faltante |
| 403 | Prohibido - QR inválido o membresía inactiva |
| 404 | Recurso no encontrado |
| 422 | Error de validación en los datos enviados |

---

## Ejemplos con JavaScript (Fetch)

### Listar miembros
```javascript
fetch('http://localhost/api/v1/endpoint/gimnasio/miembros', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Crear miembro
```javascript
fetch('http://localhost/api/v1/endpoint/gimnasio/miembros', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: "Juan Perez",
    dni: "12345678",
    fecha_nacimiento: "1990-01-01",
    genero: "M",
    estado: "Activo",
    fecha_registro: "2025-11-01"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Marcar asistencia con QR
```javascript
fetch('http://localhost/api/v1/endpoint/gimnasio/marcar-asistencia', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qr_token: "GYM_TOKEN_2025"
  })
})
.then(response => response.json())
.then(data => {
  if (data.mensaje) {
    console.log('Éxito:', data.mensaje, data.hora);
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => console.error('Error:', error));
```

---

## Ejemplos con Axios

### Configuración base
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api/v1/endpoint',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }
});
```

### Listar miembros con búsqueda
```javascript
api.get('/gimnasio/miembros', {
  params: { search: 'Juan' }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### Crear membresía
```javascript
api.post('/gimnasio/membresias', {
  id_usuario: 1,
  tipo_plan: "Mensual",
  fecha_inicio: "2025-11-01",
  fecha_fin: "2025-12-01",
  estado: "Activa"
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

---

## Errores Comunes

### 1. Error 404 - Ruta duplicada
❌ **Incorrecto:**
```
/api/v1/endpoint/api/gimnasio/miembros
```

✅ **Correcto:**
```
/api/v1/endpoint/gimnasio/miembros
```

### 2. Error 404 - Endpoint inexistente
❌ **No existe:**
```
/api/v1/endpoint/gimnasio/registro
```

✅ **Usar en su lugar:**
- Para registrar miembro: `/api/v1/endpoint/gimnasio/miembros` (POST)
- Para check-in: `/api/v1/endpoint/gimnasio/marcar-asistencia` (POST)

### 3. Error 401 - Sin autenticación
Asegúrate de incluir el header de autorización en todas las peticiones:
```
Authorization: Bearer {tu_token}
```

### 4. Error 403 - QR Check-in
- Verifica que el token QR sea correcto: `GYM_TOKEN_2025`
- Asegúrate de que el usuario tenga una membresía activa
- La membresía debe tener `estado='Activa'` y `fecha_fin >= hoy`

---

## Configuración del Token QR

Para cambiar el token QR del sistema:

```sql
UPDATE g_configuracion
SET valor = 'NUEVO_TOKEN_2025'
WHERE clave = 'qr_checkin_token';
```

---

## Testing

### Probar autenticación
```bash
# 1. Obtener token
curl -X POST http://localhost/api/v1/endpoint/login \
  -H "Content-Type: application/json" \
  -d '{"dni": "tu_dni", "password": "tu_password"}'

# 2. Usar el token en las peticiones
export TOKEN="tu_token_aqui"

curl -X GET http://localhost/api/v1/endpoint/gimnasio/miembros \
  -H "Authorization: Bearer $TOKEN"
```

### Script de prueba completo
```bash
#!/bin/bash
TOKEN="tu_token_aqui"
BASE_URL="http://localhost/api/v1/endpoint/gimnasio"

echo "1. Listar miembros"
curl -X GET "$BASE_URL/miembros" \
  -H "Authorization: Bearer $TOKEN"

echo "\n2. Crear miembro"
curl -X POST "$BASE_URL/miembros" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "dni": "99999999",
    "fecha_nacimiento": "1990-01-01",
    "genero": "M",
    "estado": "Activo",
    "fecha_registro": "2025-11-10"
  }'

echo "\n3. Marcar asistencia"
curl -X POST "$BASE_URL/marcar-asistencia" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qr_token": "GYM_TOKEN_2025"}'
```
