# Sistema de Filtrado de Datos - Team Bingo Malackaton 2025

Este documento explica cómo usar el sistema de filtrado de datos que conecta el frontend React con el backend FastAPI.

## Estructura del Proyecto

### Backend (Python/FastAPI)
- **Ubicación**: `/server/`
- **Framework**: FastAPI con Oracle Database
- **Puerto**: 8000

### Frontend (React/Vite)
- **Ubicación**: `/client/`
- **Framework**: React con Vite
- **Puerto**: 5173

## Instalación y Configuración

### Backend

1. **Navegar al directorio del servidor**:
   ```bash
   cd server
   ```

2. **Crear entorno virtual (recomendado)**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En macOS/Linux
   # o
   venv\Scripts\activate     # En Windows
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Configurar las credenciales de Oracle Database:
     ```
     WALLET_PATH=/ruta/a/tu/wallet
     WALLET_PASSWORD=tu_wallet_password
     DB_USER=tu_usuario
     DB_PASSWORD=tu_password
     DB_TNS_ALIAS=tu_tns_alias
     ```

5. **Iniciar el servidor**:
   ```bash
   # Opción 1: Usando el script
   ./start_server.sh

   # Opción 2: Directamente con Python
   python main.py

   # Opción 3: Con uvicorn
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend

1. **Navegar al directorio del cliente**:
   ```bash
   cd client
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - El archivo `.env` ya está configurado con:
     ```
     VITE_API_BASE_URL=http://localhost:8000
     ```

4. **Iniciar el cliente**:
   ```bash
   npm run dev
   ```

## Uso del Sistema

### Filtros Disponibles

1. **Comunidades Autónomas**: Selección múltiple de comunidades españolas
2. **Año de Nacimiento**: Rango deslizante (mín-máx)
3. **Sexo**: Selección múltiple (Hombre, Mujer, Otros)
4. **Diagnósticos**: Selección múltiple de diagnósticos médicos
5. **Centros**: Selección múltiple de centros médicos (primeros 20 mostrados)

### Cómo Filtrar

1. **Seleccionar filtros**: Marca las casillas de verificación para los filtros deseados
2. **Ajustar rango de edad**: Usa los controles deslizantes para el año de nacimiento
3. **Aplicar filtros**: Haz clic en el botón "Filtrar"
4. **Ver resultados**: Los datos filtrados aparecerán en la tabla
5. **Navegar páginas**: Usa los botones "Anterior" y "Siguiente" para la paginación

### Funcionalidades

- **Filtrado en tiempo real**: Los filtros se aplican al hacer clic en "Filtrar"
- **Paginación**: Navegación por páginas de 20 registros
- **Contador de resultados**: Muestra el total de registros encontrados
- **Manejo de errores**: Fallback a datos mock si no hay conexión con el servidor
- **Carga dinámica**: Indicador de carga durante las consultas

## Endpoints del API

### `GET /`
- **Descripción**: Endpoint de salud del API
- **Respuesta**: Mensaje de confirmación

### `POST /api/filter-patients`
- **Descripción**: Filtra pacientes según criterios
- **Body**:
  ```json
  {
    "comunidades": ["Madrid", "Barcelona"],
    "año_nacimiento_min": 1970,
    "año_nacimiento_max": 1990,
    "sexo": ["Hombre"],
    "diagnosticos": ["Diagnóstico específico"],
    "centros": ["Centro-123"],
    "page": 1,
    "rows_per_page": 20
  }
  ```
- **Respuesta**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "nombre": "Juan Pérez",
        "comunidad": "Madrid",
        "año_nacimiento": 1975,
        "sexo": "Hombre",
        "diagnostico": "Diagnóstico específico",
        "centro": "Centro-123",
        "fecha_ingreso": "1/15/20",
        "fecha_fin_contacto": "20/01/2020",
        "estancia_dias": 5
      }
    ],
    "total_records": 150,
    "current_page": 1,
    "total_pages": 8,
    "rows_per_page": 20
  }
  ```

### `GET /api/patients`
- **Descripción**: Obtiene todos los pacientes con paginación
- **Parámetros**: `page`, `rows_per_page`

### `GET /api/filter-options`
- **Descripción**: Obtiene opciones disponibles para filtros
- **Respuesta**:
  ```json
  {
    "comunidades": ["Madrid", "Barcelona", "..."],
    "sexos": ["Hombre", "Mujer", "Otros"],
    "diagnosticos": ["Diagnóstico 1", "Diagnóstico 2", "..."],
    "centros": ["Centro-123", "Centro-456", "..."],
    "año_nacimiento_range": {"min": 1950, "max": 2005}
  }
  ```

## Estructura de Base de Datos

### Tabla: `DATOS_ORIGINALES`
```sql
-- Campos principales utilizados:
NOMBRE VARCHAR2(64)               -- Nombre del paciente
COMUNIDAD_AUTONOMA VARCHAR2(64)   -- Comunidad autónoma
FECHA_DE_NACIMIENTO VARCHAR2(64)  -- Fecha nacimiento (MM/DD/YY)
SEXO VARCHAR2(64)                 -- Sexo (1=Hombre, 2=Mujer, 3=Otros)
CATEGORIA VARCHAR2(256)           -- Categoría diagnóstica
CENTRO_RECODIFICADO VARCHAR2(64)  -- Identificador del centro médico
FECHA_DE_INGRESO VARCHAR2(64)     -- Fecha de ingreso (M/D/YY)
FECHA_DE_FIN_CONTACTO VARCHAR2(64) -- Fecha de fin (DD/MM/YYYY)
ESTANCIA_DIAS VARCHAR2(64)        -- Días de estancia
```

## Solución de Problemas

### Error de Conexión a Base de Datos
- Verificar credenciales en `.env`
- Comprobar que el wallet esté en la ruta correcta
- Verificar conectividad de red

### Frontend no se conecta al Backend
- Verificar que el backend esté ejecutándose en puerto 8000
- Comprobar la configuración de CORS en `main.py`
- Verificar la URL en `.env` del cliente

### Datos Mock aparecen en lugar de datos reales
- Indica que hay un problema de conexión con el backend
- Revisar logs del servidor para errores
- Verificar que la base de datos esté accesible

## Desarrollo

### Agregar nuevos filtros
1. Actualizar modelo `FilterRequest` en `main.py`
2. Modificar `build_filter_conditions` en `patient_filter_service.py`
3. Agregar controles en `DataFilteringPage.jsx`

### Modificar esquema de base de datos
1. Actualizar consultas SQL en `patient_filter_service.py`
2. Modificar modelo `PatientRecord` en `main.py`
3. Actualizar el frontend para mostrar nuevos campos

## Tecnologías Utilizadas

- **Backend**: Python, FastAPI, Oracle Database, Pydantic, uvicorn
- **Frontend**: React, Vite, JavaScript ES6+
- **Base de Datos**: Oracle Database con wallet de conexión
- **Comunicación**: REST API con JSON