# Documentación de API - Login Miembro Gimnasio

## Descripción General
Este documento detalla el nuevo endpoint creado para la autenticación de miembros del gimnasio utilizando su DNI. Esta funcionalidad permite obtener la información completa del miembro, su estado de membresía y su historial de asistencia.

## Endpoint: Login de Miembro

**URL:** `/api/endpoint/gimnasio/miembros/login`
**Método:** `POST`
**Acceso:** Público (Sin autenticación previa requerida, diseñada para kiosco o app de usuario)

### Parámetros del Request

El cuerpo de la solicitud debe enviarse en formato JSON.

| Campo | Tipo   | Requerido | Descripción |
|-------|--------|-----------|-------------|
| `dni` | String | Sí        | Documento Nacional de Identidad del miembro. |
| `password` | String | Sí     | Contraseña del miembro (Por defecto: 12345678). |

**Ejemplo de Request:**

```json
{
    "dni": "12345678",
    "password": "mi_password_seguro"
}
```

### Respuesta Exitosa (200 OK)

Si las credenciales son correctas, se devuelve un objeto JSON con `success: true` y los datos del miembro en `data`.

**Estructura de la respuesta:**

*   **Información Básica**: Datos del perfil (nombre, foto, etc.).
*   **Membresía Actual**: Objeto calculado con la membresía activa o la más reciente.
*   **Días Restantes**: Cálculo de días hasta el vencimiento de la membresía activa.
*   **Relaciones**:
    *   `membresias`: Historial completo de membresías.
    *   `asistencias`: Últimas 20 asistencias registradas.
    *   `metas`: Metas asociadas al usuario.

**Ejemplo de Respuesta:**

```json
{
    "success": true,
    "data": {
        "id_usuario": 15,
        "nombre": "Juan Perez",
        "dni": "12345678",
        "celular": "999999999",
        "fecha_nacimiento": "1990-01-01",
        "genero": "M",
        "foto_perfil": "gimnasio/fotos_perfil/miembro_15_1700000000.jpg",
        "historial_fotos": [],
        "fecha_registro": "2023-01-01",
        "estado": "Activo",
        "membresia_actual": {
            "id_membresia": 102,
            "tipo_plan": "Mensual",
            "fecha_inicio": "2024-01-01",
            "fecha_fin": "2024-02-01",
            "estado": "Activo"
        },
        "dias_restantes": 12,
        "membresias": [
            {
                "id_membresia": 102,
                "tipo_plan": "Mensual",
                "fecha_inicio": "2024-01-01",
                "fecha_fin": "2024-02-01",
                "estado": "Activo"
            },
            {
                "id_membresia": 90,
                "tipo_plan": "Mensual",
                "fecha_inicio": "2023-12-01",
                "fecha_fin": "2024-01-01",
                "estado": "Vencido"
            }
        ],
        "asistencias": [
            {
                "id_asistencia": 505,
                "id_usuario": 15,
                "fecha_asistencia": "2024-01-15",
                "hora_entrada": "08:30:00"
            },
            {
                "id_asistencia": 504,
                "id_usuario": 15,
                "fecha_asistencia": "2024-01-14",
                "hora_entrada": "09:00:00"
            }
        ],
        "metas": []
    }
}
```

### Respuesta de Error

**Credenciales Incorrectas (401 Unauthorized)**

Si el DNI o la contraseña no coinciden.

```json
{
    "success": false,
    "message": "Credenciales incorrectas"
}
```

**Validación Fallida (422 Unprocessable Entity)**

Si no se envía el campo `dni` o `password`.

```json
{
    "message": "The password field is required.",
    "errors": {
        "password": [
            "The password field is required."
        ]
    }
}
```

## Detalles de Implementación

### Controlador: `GMiembroController`

El método `login` realiza las siguientes acciones:
1.  Valida que se reciban `dni` y `password`.
2.  Busca al miembro por `dni` con sus relaciones.
3.  Verifica la contraseña usando `Hash::check`.
4.  Calcula la `membresiaActiva` y `dias_restantes`.
5.  Retorna los datos o un error 401 si falla la autenticación.

### Ruta

Se ha definido la ruta en `routes/api.php` bajo el prefijo del gimnasio:

```php
Route::prefix('/endpoint/gimnasio')->group(function () {
    Route::post('miembros/login', [GMiembroController::class, 'login']);
    // ...
});
```
