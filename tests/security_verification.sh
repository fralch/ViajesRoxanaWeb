#!/bin/bash

# Script de verificación de seguridad
# Verifica que las correcciones de seguridad están funcionando correctamente

echo "🔒 VERIFICACIÓN DE SEGURIDAD - Viajes Roxana"
echo "==========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="https://grupoviajesroxana.com"
API_URL="$BASE_URL/api/v1"
PASSED=0
FAILED=0

# Función para verificar resultado
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        ((FAILED++))
    fi
}

echo "📋 Test 1: Verificar  API requiere autenticación"
echo "---------------------------------------------------"

# Test 1.1: GET /hijos sin autenticación debe fallar
echo -n "1.1 GET /api/v1/endpoint/hijos (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/hijos")
if [ "$response" -eq 401 ]; then
    check_result 0 "API rechaza acceso sin autenticación (401)"
else
    check_result 1 "API NO requiere autenticación (esperado 401, recibido $response)"
fi

# Test 1.2: GET /hijos/{id} sin autenticación debe fallar
echo -n "1.2 GET /api/v1/endpoint/hijos/1 (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/hijos/1")
if [ "$response" -eq 401 ]; then
    check_result 0 "Endpoint show rechaza acceso sin autenticación"
else
    check_result 1 "Endpoint show NO requiere autenticación (recibido $response)"
fi

# Test 1.3: GET /hijos/by-dni sin autenticación debe fallar
echo -n "1.3 GET /api/v1/endpoint/hijos/by-dni/12345678 (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/hijos/by-dni/12345678")
if [ "$response" -eq 401 ]; then
    check_result 0 "Endpoint by-dni rechaza acceso sin autenticación"
else
    check_result 1 "Endpoint by-dni NO requiere autenticación (recibido $response)"
fi

echo ""
echo "📋 Test 2: Verificar filtrado de datos en formulario público"
echo "------------------------------------------------------------"

# Test 2.1: Verificar que formulario no expone datos de apoderados
echo -n "2.1 Formulario de inscripción - Verificar datos expuestos: "
# Nota: Este test requiere un paquete y grupo activo
# Ajustar los IDs según tu base de datos
FORM_RESPONSE=$(curl -s "$BASE_URL/paquete/1/grupo/1/form" -H "Accept: application/json")

# Verificar que NO contiene datos sensibles
if echo "$FORM_RESPONSE" | grep -q '"user":{"email"'; then
    check_result 1 "Formulario EXPONE emails de apoderados"
elif echo "$FORM_RESPONSE" | grep -q '"user":{"phone"'; then
    check_result 1 "Formulario EXPONE teléfonos de apoderados"
elif echo "$FORM_RESPONSE" | grep -q 'fecha_nacimiento'; then
    check_result 1 "Formulario EXPONE fechas de nacimiento"
else
    check_result 0 "Formulario NO expone datos sensibles"
fi

echo ""
echo "📋 Test 3: Verificar endpoints de geolocalización"
echo "-------------------------------------------------"

# Test 3.1: GET /geolocalizacion sin autenticación debe fallar
echo -n "3.1 GET /api/v1/endpoint/geolocalizacion (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/geolocalizacion")
if [ "$response" -eq 401 ]; then
    check_result 0 "Endpoint geolocalización protegido"
else
    check_result 1 "Endpoint geolocalización NO protegido (recibido $response)"
fi

# Test 3.2: POST /geolocalizacion sin autenticación debe fallar
echo -n "3.2 POST /api/v1/endpoint/geolocalizacion (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/endpoint/geolocalizacion")
if [ "$response" -eq 401 ]; then
    check_result 0 "POST geolocalización protegido"
else
    check_result 1 "POST geolocalización NO protegido (recibido $response)"
fi

echo ""
echo "📋 Test 4: Verificar endpoints de trazabilidad"
echo "----------------------------------------------"

# Test 4.1: GET /trazabilidad sin autenticación debe fallar
echo -n "4.1 GET /api/v1/endpoint/trazabilidad (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/trazabilidad")
if [ "$response" -eq 401 ]; then
    check_result 0 "Endpoint trazabilidad protegido"
else
    check_result 1 "Endpoint trazabilidad NO protegido (recibido $response)"
fi

echo ""
echo "📋 Test 5: Verificar notificaciones por DNI"
echo "-------------------------------------------"

# Test 5.1: GET /notificaciones sin autenticación debe fallar
echo -n "5.1 GET /api/v1/endpoint/user/notificaciones/{dni} (sin auth): "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint/user/notificaciones/12345678")
if [ "$response" -eq 401 ]; then
    check_result 0 "Endpoint notificaciones protegido"
else
    check_result 1 "Endpoint notificaciones NO protegido (recibido $response)"
fi

echo ""
echo "==========================================="
echo "📊 RESULTADOS FINALES"
echo "==========================================="
echo -e "${GREEN}Tests Pasados: $PASSED${NC}"
echo -e "${RED}Tests Fallados: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS LOS TESTS PASARON${NC}"
    echo "Las medidas de seguridad están funcionando correctamente."
    exit 0
else
    echo -e "${RED}✗ ALGUNOS TESTS FALLARON${NC}"
    echo "Revisa los endpoints que fallaron y corrige los problemas de seguridad."
    exit 1
fi
