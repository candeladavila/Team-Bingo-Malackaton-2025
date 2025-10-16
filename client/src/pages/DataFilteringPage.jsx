import React, { useState, useEffect } from 'react'
import './DataFilteringPage.css'
import ListenButton from '../components/ListenButton'  // 👈 Importa el botón

const DataFilteringPage = () => {
  const [filters, setFilters] = useState({
    comunidades: [],
    añoNacimiento: [1926, 2025],
    sexo: [],
    diagnosticos: [],
    centros: []
  })

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 20
  const [data, setData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Opciones dinámicas obtenidas del backend
  const [filterOptions, setFilterOptions] = useState({
    comunidades: [],
    sexos: [],
    diagnosticos: [],
    centros: [],
    añoNacimientoRange: { min: 1926, max: 2025 }
  })

  const comunidadesAutonomas = [
    'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
    'Castilla y León', 'Castilla-La Mancha', 'Cataluña', 'Comunidad Valenciana',
    'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'La Rioja'
  ]

  const diagnosticos = [
    'Esquizofrenia, trastornos esquizotípicos y trastornos delirantes',
    'Síndromes del comportamiento asociados con alteraciones fisiológicas y factores físicos',
    'Trastornos de la personalidad y del comportamiento en adultos',
    'Trastornos del humor [afectivos]',
    'Trastornos emocionales y del comportamiento que aparecen habitualmente en la niñez y en la adolescencia',
    'Trastornos mentales y del comportamiento debidos al uso de sustancias psicoactivas',
    'Trastornos neuróticos, trastornos relacionados con el estrés y trastornos somatomorfos'
  ]

  // API Base URL - obtiene de variable de entorno o usa valor por defecto
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://insight-server-rose.vercel.app'

  // Función para formatear fechas a DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    // Si la fecha ya viene en formato DD/MM/YYYY, la devolvemos tal como está
    if (dateString.includes('/') && dateString.split('/').length === 3) {
      const parts = dateString.split('/')
      // Si tiene formato MM/DD/YY o similar, reformateamos
      if (parts[2].length === 2) {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
        return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${year}`
      }
      // Si ya está en formato DD/MM/YYYY, lo devolvemos
      return dateString
    }
    
    // Si viene en formato ISO (YYYY-MM-DD), lo convertimos
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}/${month}/${year}`
    } catch (error) {
      return dateString
    }
  }

  // Cargar opciones de filtro al montar el componente
  useEffect(() => {
    loadFilterOptions()
    loadPatients() // Cargar datos iniciales
  }, [])

  // Cargar opciones de filtro desde el backend
  const loadFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filter-options`)
      if (response.ok) {
        const options = await response.json()
        setFilterOptions({
          comunidades: options.comunidades || comunidadesAutonomas,
          sexos: options.sexos || ['Hombre', 'Mujer', 'Otros'],
          diagnosticos: options.diagnosticos || diagnosticos,
          centros: options.centros || [],
          añoNacimientoRange: options.año_nacimiento_range || { min: 1926, max: 2025 }
        })
      }
    } catch (error) {
      console.warn('No se pudieron cargar las opciones de filtro del servidor, usando valores por defecto:', error)
      // Usar valores por defecto si falla la carga
      setFilterOptions({
        comunidades: comunidadesAutonomas,
        sexos: ['Hombre', 'Mujer', 'Otros'],
        diagnosticos: diagnosticos,
        centros: [],
        añoNacimientoRange: { min: 1926, max: 2025 }
      })
    }
  }

  // Cargar pacientes con filtros aplicados
  const loadPatients = async (appliedFilters = null, page = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const filtersToUse = appliedFilters || filters
      
      const requestBody = {
        comunidades: filtersToUse.comunidades,
        año_nacimiento_min: filtersToUse.añoNacimiento[0],
        año_nacimiento_max: filtersToUse.añoNacimiento[1],
        sexo: filtersToUse.sexo,
        diagnosticos: filtersToUse.diagnosticos,
        centros: filtersToUse.centros,
        page: page,
        rows_per_page: rowsPerPage
      }

      const response = await fetch(`${API_BASE_URL}/api/filter-patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      
      setData(result.data)
      setTotalRecords(result.total_records)
      setTotalPages(result.total_pages)
      setCurrentPage(result.current_page)
      
    } catch (error) {
      setError(`Error al cargar datos: ${error.message}`)
      console.error('Error al cargar pacientes:', error)
      
      // Generar datos mock en caso de error de conexión
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  // Generar datos mock como respaldo
  const generateMockData = () => {
    const mockData = Array.from({ length: 156 }, (_, i) => ({
      id: i + 1,
      nombre: `Paciente ${i + 1}`,
      comunidad: comunidadesAutonomas[Math.floor(Math.random() * comunidadesAutonomas.length)],
      año_nacimiento: 1950 + Math.floor(Math.random() * 50),
      sexo: ['Hombre', 'Mujer', 'Otros'][Math.floor(Math.random() * 3)],
      diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)],
      centro: `Centro-${Math.floor(Math.random() * 1000)}`,
      fecha_ingreso: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/20`,
      fecha_fin_contacto: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2020`,
      estancia_dias: Math.floor(Math.random() * 30) + 1
    }))

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentData = mockData.slice(startIndex, endIndex)
    
    setData(currentData)
    setTotalRecords(mockData.length)
    setTotalPages(Math.ceil(mockData.length / rowsPerPage))
  }

  const handleComunidadChange = (comunidad) => {
    setFilters(prev => ({
      ...prev,
      comunidades: prev.comunidades.includes(comunidad)
        ? prev.comunidades.filter(c => c !== comunidad)
        : [...prev.comunidades, comunidad]
    }))
  }

  const handleDiagnosticoChange = (diagnostico) => {
    setFilters(prev => ({
      ...prev,
      diagnosticos: prev.diagnosticos.includes(diagnostico)
        ? prev.diagnosticos.filter(d => d !== diagnostico)
        : [...prev.diagnosticos, diagnostico]
    }))
  }

  const handleSexoChange = (sexo) => {
    setFilters(prev => ({
      ...prev,
      sexo: prev.sexo.includes(sexo)
        ? prev.sexo.filter(s => s !== sexo)
        : [...prev.sexo, sexo]
    }))
  }

  const handleCentroChange = (centro) => {
    setFilters(prev => ({
      ...prev,
      centros: prev.centros.includes(centro)
        ? prev.centros.filter(c => c !== centro)
        : [...prev.centros, centro]
    }))
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    loadPatients(filters, 1)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPatients(filters, newPage)
    }
  }

  return (
    <div className="data-filtering-page clean-page">
      
      {/* Animaciones de fondo */}
      
      <div className="background-animations">
       
        {/* Hojas y puntos estáticos con pulsación */}
        <div className="static-element static-leaf-large"></div>
        <div className="static-element static-dot-medium"></div>
        <div className="static-element static-leaf-small"></div>
        <div className="static-element static-dot-large"></div>
        <div className="static-element static-leaf-medium"></div>
        <div className="static-element static-dot-small"></div>
        <div className="static-element static-leaf-large"></div>
        <div className="static-element static-dot-medium"></div>
        <div className="static-element static-leaf-small"></div>
        <div className="static-element static-dot-large"></div>
        <div className="static-element static-leaf-medium"></div>
        <div className="static-element static-dot-small"></div>
        <div className="static-element static-leaf-large"></div>
        <div className="static-element static-dot-medium"></div>
        <div className="static-element static-leaf-small"></div>
        <div className="static-element static-dot-large"></div>
        <div className="static-element static-leaf-medium"></div>
        <div className="static-element static-dot-small"></div>
        <div className="static-element static-leaf-large"></div>
        <div className="static-element static-dot-medium"></div>
        <div className="static-element static-leaf-small"></div>
        <div className="static-element static-dot-large"></div>
        <div className="static-element static-leaf-medium"></div>
        <div className="static-element static-dot-small"></div>
        <div className="static-element static-leaf-large"></div>
        <div className="static-element static-dot-medium"></div>
        <div className="static-element static-leaf-small"></div>
        <div className="static-element static-dot-large"></div>
        <div className="static-element static-leaf-medium"></div>
        <div className="static-element static-dot-small"></div>
         
        
        {/* Hojas que caen */}
        <div className="falling-element falling-leaf-large"></div>
        <div className="falling-element falling-leaf-medium"></div>
        <div className="falling-element falling-leaf-small"></div>
        <div className="falling-element falling-leaf-large"></div>
        <div className="falling-element falling-leaf-medium"></div>
        <div className="falling-element falling-leaf-small"></div>
        <div className="falling-element falling-leaf-large"></div>
        <div className="falling-element falling-leaf-medium"></div>
      </div>
      {/* Contenido principal */}
      <ListenButton />  {/* 👈 Añade el botón aquí */}
      <header className="page-header">
        <h1>Filtrado de Datos</h1>
        <p>Aplica filtros avanzados para refinar tu conjunto de datos</p>
      </header>

      {/* Rectángulo 1: Selección de parámetros */}
      <section className="filter-section">
        <h2>Selección de Parámetros para el Filtrado</h2>
        
        {/* Comunidades Autónomas */}
        <div className="filter-group">
          <h3>Comunidades Autónomas</h3>
          <div className="comunidades-grid">
            {(filterOptions.comunidades.length > 0 ? filterOptions.comunidades : comunidadesAutonomas).map(comunidad => (
              <label key={comunidad} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.comunidades.includes(comunidad)}
                  onChange={() => handleComunidadChange(comunidad)}
                />
                <span>{comunidad}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Año de Nacimiento */}
        <div className="filter-group">
          <h3>Año de Nacimiento</h3>
          <div className="range-slider">
            <div className="range-values">
              <span>{filters.añoNacimiento[0]}</span>
              <span>{filters.añoNacimiento[1]}</span>
            </div>
            <input
              type="range"
              min="1926"
              max="2025"
              value={filters.añoNacimiento[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                añoNacimiento: [parseInt(e.target.value), prev.añoNacimiento[1]]
              }))}
              className="range-min"
            />
            <input
              type="range"
              min="1926"
              max="2025"
              value={filters.añoNacimiento[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                añoNacimiento: [prev.añoNacimiento[0], parseInt(e.target.value)]
              }))}
              className="range-max"
            />
          </div>
        </div>

        {/* Sexo */}
        <div className="filter-group">
          <h3>Sexo</h3>
          <div className="sexo-grid">
            {(filterOptions.sexos.length > 0 ? filterOptions.sexos : ['Hombre', 'Mujer', 'Otros']).map(sexo => (
              <label key={sexo} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.sexo.includes(sexo)}
                  onChange={() => handleSexoChange(sexo)}
                />
                <span>{sexo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Centros */}
        <div className="filter-group">
          <h3>Centros</h3>
          <div className="centros-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            {filterOptions.centros.slice(0, 20).map(centro => (
              <label key={centro} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.centros.includes(centro)}
                  onChange={() => handleCentroChange(centro)}
                />
                <span title={centro}>{centro.length > 25 ? centro.substring(0, 25) + '...' : centro}</span>
              </label>
            ))}
          </div>
          {filterOptions.centros.length > 20 && (
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              Mostrando los primeros 20 centros de {filterOptions.centros.length} disponibles
            </p>
          )}
        </div>

        {/* Diagnósticos */}
        <div className="filter-group">
          <h3>Diagnósticos</h3>
          <div className="diagnosticos-grid">
            {(filterOptions.diagnosticos.length > 0 ? filterOptions.diagnosticos : diagnosticos).map(diagnostico => (
              <label key={diagnostico} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.diagnosticos.includes(diagnostico)}
                  onChange={() => handleDiagnosticoChange(diagnostico)}
                />
                <span>{diagnostico}</span>
              </label>
            ))}
          </div>
          {/* Botón Filtrar debajo del rectángulo de diagnósticos */}
          <div className="filter-actions">
            <button
              type="button"
              className="apply-filter-btn"
              aria-label="Aplicar filtros de búsqueda"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
          </div>
        </div>
      </section>

      {/* Rectángulo 2: Resultado de la tabla */}
      <section className="results-section">
        <h2>Resultados del filtrado</h2>
        
        {error && (
          <div className="error-message" style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        {loading && (
          <div className="loading-message" style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666' 
          }}>
            Cargando datos...
          </div>
        )}
        
        <div className="table-container">
          
          <table className="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Comunidad Autónoma</th>
                <th>Año de Nacimiento</th>
                <th>Sexo</th>
                <th>Centro Médico</th>
                <th>Fecha de Ingreso</th>
                <th>Fecha de Fin de Contacto</th>
                <th>Estancia (días)</th>
                <th>Diagnóstico Completo</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td title={row.nombre}>{row.nombre}</td>
                  <td title={row.comunidad}>{row.comunidad}</td>
                  <td>{row.año_nacimiento}</td>
                  <td>{row.sexo}</td>
                  <td title={row.centro}>{row.centro}</td>
                  <td>{formatDate(row.fecha_ingreso)}</td>
                  <td>{formatDate(row.fecha_fin_contacto)}</td>
                  <td>{row.estancia_dias}</td>
                  <td title={row.diagnostico}>{row.diagnostico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="pagination-btn"
          >
            Anterior
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="pagination-btn"
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
    
  )
  
}

export default DataFilteringPage