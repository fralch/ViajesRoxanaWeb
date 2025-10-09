# 🔒 GUÍA DE SEGURIDAD - Desarrollo y Mantenimiento

Esta guía debe ser seguida por todos los desarrolladores que trabajen en este proyecto.

---

## 📋 Principios Fundamentales

### 1. Principio de Mínimo Privilegio
- **NUNCA** exponer más datos de los estrictamente necesarios
- Solo retornar información que el usuario actual tiene permiso de ver
- Filtrar datos sensibles antes de enviar al frontend

### 2. Autenticación Obligatoria
- **TODOS** los endpoints API deben requerir autenticación (excepto login/registro)
- Usar middleware `auth:sanctum` en las rutas
- Validar autenticación al inicio de cada método del controlador

### 3. Autorización por Recurso
- Verificar que el usuario tenga permiso para acceder a cada recurso
- Admins pueden ver todo, usuarios normales solo sus propios datos
- Nunca confiar en datos del frontend para validar permisos

---

## ✅ Checklist de Seguridad para Nuevos Endpoints

Antes de crear un nuevo endpoint o modificar uno existente, verifica:

- [ ] **¿Requiere autenticación?** → Agregar middleware `auth:sanctum`
- [ ] **¿Expone datos de usuarios?** → Verificar permisos (admin o propietario)
- [ ] **¿Retorna datos sensibles?** → Filtrar email, phone, DNI, etc.
- [ ] **¿Es una operación peligrosa?** → Solo permitir a admins
- [ ] **¿Permite búsquedas?** → Implementar rate limiting
- [ ] **¿Incluye relaciones Eloquent?** → Verificar qué datos se exponen

---

## 🚫 Datos Sensibles - NO Exponer Públicamente

### Información Personal (GDPR):
- ❌ Correos electrónicos
- ❌ Números de teléfono
- ❌ Direcciones físicas
- ❌ DNI / Documentos de identidad
- ❌ Fechas de nacimiento completas
- ❌ Contraseñas (ni siquiera hasheadas)
- ❌ Tokens de autenticación

### Información de Menores:
- ❌ Ubicación GPS en tiempo real
- ❌ Historial de movimientos
- ❌ Fotos sin autorización
- ❌ Información médica
- ❌ Datos de contacto de emergencia

### Información del Sistema:
- ❌ Claves API
- ❌ Variables de entorno
- ❌ Rutas internas del servidor
- ❌ Mensajes de error detallados (en producción)

---

## ✅ Ejemplo de Endpoint Seguro

### ❌ INCORRECTO (Vulnerable):
```php
public function index() {
    // NO HACER ESTO
    return Hijo::with('user')->get(); // Expone TODO
}
```

### ✅ CORRECTO (Seguro):
```php
public function index(Request $request): JsonResponse {
    // 1. Validar autenticación
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    // 2. Aplicar filtro de permisos
    if (!Auth::user()->is_admin) {
        $query = Hijo::where('user_id', Auth::id());
    } else {
        $query = Hijo::query();
    }

    // 3. NO incluir relaciones sensibles
    $hijos = $query->get();

    // 4. Filtrar datos sensibles
    $hijosFiltered = $hijos->map(function($hijo) {
        return [
            'id' => $hijo->id,
            'nombres' => $hijo->nombres,
            'doc_tipo' => $hijo->doc_tipo,
            // NO incluir: email, phone, DNI del padre
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $hijosFiltered
    ]);
}
```

---

## 🛡️ Protección de Rutas

### Rutas Públicas (Sin Autenticación):
```php
// Solo login y registro
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
```

### Rutas Protegidas (Con Autenticación):
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/hijos', [HijoController::class, 'index']);
    Route::get('/hijos/{hijo}', [HijoController::class, 'show']);
    // ... más rutas protegidas
});
```

### Rutas de Admin (Solo Administradores):
```php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/bulk-import', [ImportController::class, 'bulkImport']);
});
```

---

## 🔍 Validación de Permisos en Controllers

### Template para Validar Permisos:
```php
// Al inicio del método
public function show(Hijo $hijo): JsonResponse {
    // 1. Verificar autenticación
    if (!Auth::check()) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // 2. Verificar permisos sobre el recurso
    if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    // 3. Continuar con la lógica
    // ...
}
```

---

## 🧪 Testing de Seguridad

### Script de Verificación:
```bash
# Ejecutar tests de seguridad
./tests/security_verification.sh
```

### Tests Manuales:
```bash
# 1. Verificar que endpoint requiere autenticación
curl https://tupagina.com/api/endpoint
# Debe retornar: 401 Unauthorized

# 2. Verificar que no expone datos sensibles
curl -H "Authorization: Bearer {token}" \
     https://tupagina.com/api/endpoint | jq .
# Revisar que NO aparezcan emails, phones, etc.

# 3. Verificar control de permisos
# Intentar acceder a recurso de otro usuario
curl -H "Authorization: Bearer {user1_token}" \
     https://tupagina.com/api/hijos/{user2_child_id}
# Debe retornar: 403 Forbidden
```

---

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO publicarla públicamente**
2. **Reportar inmediatamente a:** security@viajesroxana.com
3. **Incluir:**
   - Descripción del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de corrección (opcional)

---

## 📚 Recursos Adicionales

### Lecturas Recomendadas:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
- [GDPR Compliance Guide](https://gdpr.eu/)

### Herramientas de Seguridad:
- **Laravel Security Checker:** `composer audit`
- **Static Analysis:** `./vendor/bin/phpstan analyse`
- **Dependency Vulnerabilities:** `composer audit`

---

## 📝 Changelog de Seguridad

Mantén este documento actualizado con cada cambio de seguridad:

```markdown
### [YYYY-MM-DD] - Título del Cambio
- **Archivo:** `path/to/file.php`
- **Cambio:** Descripción breve
- **Severidad:** BAJA | MEDIA | ALTA | CRÍTICA
- **Estado:** EN REVISIÓN | RESUELTO
```

---

## ✅ Checklist Pre-Deploy

Antes de hacer deploy a producción:

- [ ] Tests de seguridad pasados (`./tests/security_verification.sh`)
- [ ] Code review enfocado en seguridad
- [ ] Verificar que no hay claves/secrets en el código
- [ ] Verificar que `.env` no está commiteado
- [ ] Verificar que debug mode está OFF en producción
- [ ] Verificar que los logs no exponen información sensible
- [ ] Backup de base de datos realizado

---

**Última actualización:** 2025-10-09
**Responsable:** Equipo de Desarrollo
**Contacto:** security@viajesroxana.com
