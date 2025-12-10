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

**Ejemplo de Request:**

```json
{
    "dni": "12345678"
}
```

### Respuesta Exitosa (200 OK)

Si el miembro es encontrado, se devuelve un objeto JSON con `success: true` y los datos del miembro en `data`.

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
        "foto_perfil": "gimnasio/fotos_perfil/miembro_15_1700000000.jpg",
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
                "fecha_hora": "2024-01-15 08:30:00",
                "tipo": "Entrada"
            },
            {
                "id_asistencia": 504,
                "fecha_hora": "2024-01-14 09:00:00",
                "tipo": "Entrada"
            }
        ],
        "metas": []
    }
}
```

### Respuesta de Error

**Miembro no encontrado (404 Not Found)**

Si el DNI no corresponde a ningún miembro registrado.

```json
{
    "success": false,
    "message": "Miembro no encontrado"
}
```

**Validación Fallida (422 Unprocessable Entity)**

Si no se envía el campo `dni`.

```json
{
    "message": "The dni field is required.",
    "errors": {
        "dni": [
            "The dni field is required."
        ]
    }
}
```

## Detalles de Implementación

### Controlador: `GMiembroController`

El método `login` realiza las siguientes acciones:
1.  Busca al miembro por `dni`.
2.  Carga relaciones usando *Eager Loading* (`with`):
    *   `membresias`: Ordenadas por fecha de fin descendente.
    *   `asistencias`: Limitadas a las últimas 20 para optimizar la carga.
    *   `metas`.
3.  Calcula la `membresiaActiva` buscando en la colección aquella con estado 'Activo'. Si no existe, toma la más reciente.
4.  Calcula `dias_restantes` usando `Carbon` si la fecha de fin es futura.
5.  Inyecta estos atributos calculados en el modelo antes de retornar la respuesta JSON.

### Ruta

Se ha definido la ruta en `routes/api.php` bajo el prefijo del gimnasio:

```php
Route::prefix('/endpoint/gimnasio')->group(function () {
    Route::post('miembros/login', [GMiembroController::class, 'login']);
    // ...
});
```
