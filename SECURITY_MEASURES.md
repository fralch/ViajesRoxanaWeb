# Medidas de Seguridad - Formulario de Inscripción

## Problema Reportado
Un padre reportó que los datos personales de TODOS los hijos inscritos (incluyendo nombres completos, fechas de nacimiento, y datos de contacto de otros padres) estaban siendo expuestos públicamente en el formulario de inscripción.

**Evidencia:** `/mnt/d/bugs/056e5bad-cdda-494f-a7e8-26ff3e3d81cd.jpeg`

## Vulnerabilidad Identificada
- **CVE Potencial:** Exposición masiva de datos personales (GDPR/Ley de Protección de Datos)
- **Severidad:** CRÍTICA
- **Impacto:** Violación de privacidad de menores y sus familias

## Medidas de Seguridad Implementadas

### 1. Filtrado en el Controlador (InscripcionController.php)

#### Antes (VULNERABLE):
```php
// Exponía TODOS los hijos inscritos con datos completos
$hijosInscritos = Hijo::select('id', 'nombres', 'doc_tipo', 'doc_numero', 'user_id', 'fecha_nacimiento')
    ->whereHas('inscripciones', function($query) use ($subgrupos) {
        $query->whereIn('subgrupo_id', $subgrupos->pluck('id'));
    })
    ->with(['user:id,name,email,phone', ...])
    // Retornaba datos de TODOS los padres
```

#### Después (SEGURO):
```php
// Solo expone hijos SIN apoderado asignado (user_id = 1)
$hijosInscritos = Hijo::select('id', 'nombres', 'doc_tipo', 'doc_numero', 'user_id')
    ->where('user_id', 1) // Filtro de seguridad
    ->whereHas('inscripciones', function($query) use ($subgrupos) {
        $query->whereIn('subgrupo_id', $subgrupos->pluck('id'));
    })
    // NO incluye datos de apoderados ni fechas de nacimiento
```

### 2. Cambios en el Frontend (form.jsx)

#### Removido:
- Lógica que mostraba información de apoderados existentes
- Sección "Apoderado Confirmado" que exponía datos personales
- Referencias al objeto `user` con email, teléfono y DNI de otros padres

#### Agregado:
- Validación que solo permite ver hijos sin apoderado asignado
- Filtrado automático de hijos ya seleccionados
- Modo obligatorio de creación de apoderado para todos los casos

### 3. Datos Eliminados del Response

**Ya NO se expone:**
- ✅ `fecha_nacimiento` de los hijos
- ✅ `user.name` (nombre del apoderado)
- ✅ `user.email` (correo del apoderado)
- ✅ `user.phone` (teléfono del apoderado)
- ✅ `user.dni` (DNI del apoderado)

**Solo se expone:**
- ✅ `id` (identificador interno necesario)
- ✅ `nombres` (nombre del hijo sin apoderado)
- ✅ `doc_tipo` (tipo de documento del hijo)
- ✅ `doc_numero` (número de documento del hijo)
- ✅ `user_id` (solo el ID, no los datos del usuario)
- ✅ `subgrupo_nombre` (nombre del subgrupo)

### 4. Principios de Seguridad Aplicados

1. **Principio de Mínimo Privilegio**: Solo se expone información estrictamente necesaria
2. **Segregación de Datos**: Los datos de apoderados asignados NO son accesibles públicamente
3. **Filtrado en Origen**: La restricción se aplica en el backend, no solo en el frontend
4. **Privacy by Design**: Solo se muestran hijos que necesitan apoderado (user_id = 1)

### 5. Flujo de Seguridad

```
Usuario accede al formulario
    ↓
Backend filtra: WHERE user_id = 1
    ↓
Solo retorna hijos SIN apoderado asignado
    ↓
Frontend muestra solo datos mínimos necesarios
    ↓
Usuario asigna apoderado
    ↓
Hijo desaparece del listado público (user_id != 1)
```

## Verificación de Seguridad

### Para verificar que la vulnerabilidad está corregida:

1. **Acceder al formulario público:**
   - URL: `/paquete/{id}/grupo/{id}/form`
   - Verificar que solo se muestran hijos sin apoderado

2. **Revisar el Network Tab (DevTools):**
   - No debe aparecer información de `user.email`, `user.phone`, `user.name`
   - Solo debe aparecer `user_id` como número entero

3. **Verificar en la base de datos:**
   ```sql
   -- Los hijos con apoderado (user_id != 1) NO deben aparecer en el formulario
   SELECT * FROM hijos WHERE user_id != 1;
   ```

## Recomendaciones Adicionales

### A Corto Plazo:
- [ ] Implementar rate limiting en el endpoint del formulario
- [ ] Agregar CAPTCHA para prevenir scraping automatizado
- [ ] Auditar otros endpoints públicos que puedan exponer datos

### A Mediano Plazo:
- [ ] Implementar sistema de logs de acceso a datos sensibles
- [ ] Agregar alertas cuando se accede masivamente al formulario
- [ ] Review completo de GDPR compliance

### A Largo Plazo:
- [ ] Implementar encriptación de datos sensibles en la base de datos
- [ ] Agregar sistema de consentimiento de datos (GDPR)
- [ ] Política de retención y eliminación de datos

## Contacto para Reportes de Seguridad

Si encuentras vulnerabilidades de seguridad, por favor reportarlas de manera responsable a:
- Email: security@viajesroxana.com
- No publicar vulnerabilidades antes de que sean corregidas

## Vulnerabilidades Adicionales Descubiertas

### API Endpoints Completamente Desprotegidos (CRÍTICA)

Durante la auditoría se descubrió que **TODOS** los endpoints API estaban:
- ❌ **Sin autenticación requerida**
- ❌ **Sin control de permisos**
- ❌ **Exponiendo datos sensibles de TODOS los usuarios**

#### Endpoints Vulnerables Identificados:
```
GET /api/v1/endpoint/hijos - Lista TODOS los hijos con datos de padres
GET /api/v1/endpoint/hijos/{id} - Detalles de cualquier hijo
GET /api/v1/endpoint/hijos/by-dni/{dni} - Buscar hijo por DNI
GET /api/v1/endpoint/geolocalizacion/* - Ubicación de hijos
GET /api/v1/endpoint/trazabilidad/* - Historial de movimientos
```

#### Datos Expuestos:
- Nombres completos de niños y padres
- Emails de padres
- Teléfonos de padres
- DNI de padres e hijos
- Fechas de nacimiento
- Ubicaciones GPS en tiempo real
- Historial de movimientos

### Correcciones Aplicadas:

1. **API Controller (Api/HijoController.php):**
   - ✅ Agregada validación de autenticación en todos los métodos
   - ✅ Implementado control de permisos (solo padre o admin)
   - ✅ Filtrado de datos sensibles antes de retornar
   - ✅ Segregación: usuarios normales solo ven sus propios hijos

2. **API Routes (routes/api.php):**
   - ✅ Agregado middleware `auth:sanctum` a todas las rutas protegidas
   - ✅ Solo rutas de login son públicas

### Ejemplo de Corrección:

#### Antes (VULNERABLE):
```php
public function index() {
    // Sin autenticación, retorna TODO
    return Hijo::with('user')->get();
}
```

#### Después (SEGURO):
```php
public function index() {
    if (!Auth::check()) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Solo sus propios hijos
    if (!Auth::user()->is_admin) {
        $hijos = Hijo::where('user_id', Auth::id())->get();
    }

    // Sin datos sensibles del usuario
    return $hijos->map(function($hijo) {
        return [
            'id' => $hijo->id,
            'nombres' => $hijo->nombres,
            // NO incluye user.email, user.phone, etc.
        ];
    });
}
```

## Changelog de Seguridad

- **2025-10-09 (14:30)**: Corregida exposición masiva de datos en API endpoints
  - Archivos modificados: `Api/HijoController.php`, `routes/api.php`
  - Severidad: CRÍTICA
  - Estado: RESUELTO ✅

- **2025-10-09 (14:00)**: Corregida exposición masiva de datos de menores y padres en formulario público
  - Archivos modificados: `InscripcionController.php`, `form.jsx`
  - Severidad: CRÍTICA
  - Estado: RESUELTO ✅
