import React, { useState } from 'react'
import './DataFilteringPage.css'

const DataFilteringPage = () => {
  const [filters, setFilters] = useState({
    comunidades: [],
    añoNacimiento: [1950, 2000],
    sexo: [],
    diagnosticos: []
  })

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 20

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

  // Datos simulados de la tabla
  const mockData = Array.from({ length: 156 }, (_, i) => ({
    id: i + 1,
    nombre: `Paciente ${i + 1}`,
    comunidad: comunidadesAutonomas[Math.floor(Math.random() * comunidadesAutonomas.length)],
    añoNacimiento: 1950 + Math.floor(Math.random() * 50),
    sexo: ['Hombre', 'Mujer', 'Otros'][Math.floor(Math.random() * 3)],
    diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)]
  }))

  const totalPages = Math.ceil(mockData.length / rowsPerPage)
  const currentData = mockData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

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
            {comunidadesAutonomas.map(comunidad => (
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
              min="1950"
              max="2005"
              value={filters.añoNacimiento[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                añoNacimiento: [parseInt(e.target.value), prev.añoNacimiento[1]]
              }))}
              className="range-min"
            />
            <input
              type="range"
              min="1950"
              max="2005"
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
            {['Hombre', 'Mujer', 'Otros'].map(sexo => (
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

        {/* Diagnósticos */}
        <div className="filter-group">
          <h3>Diagnósticos</h3>
          <div className="diagnosticos-grid">
            {diagnosticos.map(diagnostico => (
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
        </div>
      </section>

      {/* Rectángulo 2: Resultado de la tabla */}
      <section className="results-section">
        <h2>Resultados del filtrado</h2>
        
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Comunidad</th>
                <th>Año Nacimiento</th>
                <th>Sexo</th>
                <th>Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.nombre}</td>
                  <td>{row.comunidad}</td>
                  <td>{row.añoNacimiento}</td>
                  <td>{row.sexo}</td>
                  <td>{row.diagnostico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Anterior
          </button>
          
          <span className="pagination-info">
            Página {currentPage} de {totalPages} ({mockData.length} registros total.)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
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