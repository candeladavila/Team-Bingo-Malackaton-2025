#!/bin/bash

# Script de validación del sistema de filtrado
# Verifica que tanto el backend como el frontend estén funcionando correctamente

echo "🔍 Validando Sistema de Filtrado - Team Bingo Malackaton 2025"
echo "============================================================="

# Función para verificar si un puerto está siendo usado
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ $service_name está ejecutándose en puerto $port"
        return 0
    else
        echo "❌ $service_name NO está ejecutándose en puerto $port"
        return 1
    fi
}

# Función para hacer una petición HTTP simple
test_endpoint() {
    local url=$1
    local description=$2
    
    echo "🧪 Probando: $description"
    echo "   URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ Endpoint responde correctamente (HTTP 200)"
        return 0
    else
        echo "❌ Endpoint falló (HTTP $response)"
        return 1
    fi
}

# Función para probar endpoint POST
test_filter_endpoint() {
    local url="http://localhost:8000/api/filter-patients"
    echo "🧪 Probando endpoint de filtrado"
    echo "   URL: $url"
    
    # Datos de prueba para el filtro
    local test_data='{
        "comunidades": [],
        "año_nacimiento_min": 1950,
        "año_nacimiento_max": 2000,
        "sexo": [],
        "diagnosticos": [],
        "page": 1,
        "rows_per_page": 5
    }'
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ Endpoint de filtrado responde correctamente (HTTP 200)"
        return 0
    else
        echo "❌ Endpoint de filtrado falló (HTTP $response)"
        return 1
    fi
}

echo
echo "📋 VERIFICACIÓN DE SERVICIOS"
echo "----------------------------"

backend_running=false
frontend_running=false

# Verificar backend (Puerto 8000)
if check_port 8000 "Backend (FastAPI)"; then
    backend_running=true
fi

# Verificar frontend (Puerto 5173)
if check_port 5173 "Frontend (Vite/React)"; then
    frontend_running=true
fi

echo
echo "📋 VERIFICACIÓN DE ENDPOINTS"
echo "----------------------------"

if [ "$backend_running" = true ]; then
    # Probar endpoint raíz
    test_endpoint "http://localhost:8000/" "Endpoint raíz del API"
    
    echo
    
    # Probar endpoint de opciones de filtro
    test_endpoint "http://localhost:8000/api/filter-options" "Opciones de filtro"
    
    echo
    
    # Probar endpoint de pacientes
    test_endpoint "http://localhost:8000/api/patients" "Lista de pacientes"
    
    echo
    
    # Probar endpoint de filtrado
    test_filter_endpoint
else
    echo "⚠️  No se pueden probar endpoints - Backend no está ejecutándose"
fi

echo
echo "📋 VERIFICACIÓN DE ARCHIVOS"
echo "---------------------------"

# Verificar archivos importantes del backend
backend_files=(
    "server/main.py"
    "server/services/patient_filter_service.py"
    "server/requirements.txt"
    "server/.env"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file NO existe"
    fi
done

# Verificar archivos importantes del frontend
frontend_files=(
    "client/src/pages/DataFilteringPage.jsx"
    "client/package.json"
    "client/.env"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file NO existe"
    fi
done

echo
echo "📋 RESUMEN"
echo "----------"

if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
    echo "🎉 ¡Sistema completamente funcional!"
    echo "   - Backend ejecutándose en: http://localhost:8000"
    echo "   - Frontend ejecutándose en: http://localhost:5173"
    echo "   - Documentación del API: http://localhost:8000/docs"
elif [ "$backend_running" = true ]; then
    echo "⚠️  Backend funcionando, pero frontend no está ejecutándose"
    echo "   - Ejecuta: cd client && npm run dev"
elif [ "$frontend_running" = true ]; then
    echo "⚠️  Frontend funcionando, pero backend no está ejecutándose"
    echo "   - Ejecuta: cd server && python main.py"
else
    echo "❌ Ningún servicio está ejecutándose"
    echo "   - Para backend: cd server && python main.py"
    echo "   - Para frontend: cd client && npm run dev"
fi

echo
echo "🔗 ENLACES ÚTILES"
echo "----------------"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "Documentación API: http://localhost:8000/docs"
echo "Redoc API: http://localhost:8000/redoc"

echo
echo "✨ Validación completada"