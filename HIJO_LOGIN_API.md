# API de Autenticación para Hijos

## Endpoint de Login para Hijos

### POST `/api/v1/endpoint/hijo-login`

Permite a los hijos iniciar sesión usando su número de documento y contraseña.

#### Parámetros de Entrada

```json
{
    "doc_numero": "12345678",
    "password_hijo": "viajesroxana"
}
```

#### Respuesta Exitosa (200)

```json
{
    "success": true,
    "message": "Inicio de sesión exitoso",
    "hijo": {
        "id": 1,
        "user_id": 1,
        "nombres": "Juan Pérez",
        "doc_tipo": "DNI",
        "doc_numero": "12345678",
        "password_hijo": "viajesroxana",
        "nums_emergencia": ["987654321"],
        "fecha_nacimiento": "2010-05-15",
        "foto": null,
        "pasatiempos": "Fútbol",
        "deportes": "Natación",
        "plato_favorito": "Pizza",
        "color_favorito": "Azul",
        "informacion_adicional": null,
        "created_at": "2025-09-15T12:00:00.000000Z",
        "updated_at": "2025-09-15T12:00:00.000000Z",
        "user": {
            // Información del padre/tutor
        },
        "inscripciones": [
            {
                // Información de inscripciones
                "grupo": {
                    // Información del grupo
                    "paquete": {
                        // Información del paquete
                    }
                }
            }
        ]
    },
    "token": "hijo_token_MTIzNDU2Nzg6MTYzMTIxMzI1MA=="
}
```

#### Respuesta de Error (422)

```json
{
    "success": false,
    "message": "Credenciales inválidas"
}
```

#### Respuesta de Error de Validación (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "doc_numero": ["The doc numero field is required."],
        "password_hijo": ["The password hijo field is required."]
    }
}
```

## Configuración de Base de Datos

Para aplicar los cambios a la base de datos, ejecutar:

```bash
php artisan migrate
```

Esta migración:
- Agrega el campo `password_hijo` a la tabla `hijos`
- Establece 'viajesroxana' como contraseña por defecto
- Mantiene compatibilidad con registros existentes

## Uso del Token

El token devuelto puede ser usado para autenticación en futuras requests:

```
Authorization: Bearer hijo_token_MTIzNDU2Nzg6MTYzMTIxMzI1MA==
```

## Ejemplo de uso con cURL

```bash
curl -X POST http://localhost/api/v1/endpoint/hijo-login \
  -H "Content-Type: application/json" \
  -d '{
    "doc_numero": "12345678",
    "password_hijo": "viajesroxana"
  }'
```