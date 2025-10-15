import React, { useState } from 'react'

const DataFilteringPage = () => {
  const [filters, setFilters] = useState({
    dateRange: '',
    category: '',
    status: '',
    searchTerm: ''
  })

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  return (
    <div className="data-filtering-page">
      <header className="page-header">
        <h1>Filtrado de Datos</h1>
        <p>Aplica filtros avanzados para refinar tu conjunto de datos</p>
      </header>
      
      <section className="filter-controls">
        <div className="filter-group">
          <label>Buscar:</label>
          <input 
            type="text" 
            placeholder="Buscar en los datos..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Rango de Fechas:</label>
          <input 
            type="date" 
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Categoría:</label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="categoria1">Categoría 1</option>
            <option value="categoria2">Categoría 2</option>
            <option value="categoria3">Categoría 3</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Estado:</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <button className="apply-filters">Aplicar Filtros</button>
          <button className="clear-filters" onClick={() => setFilters({dateRange: '', category: '', status: '', searchTerm: ''})}>
            Limpiar Filtros
          </button>
        </div>
      </section>
      
      <section className="filtered-results">
        <h2>Resultados Filtrados</h2>
        <div className="results-summary">
          <p>Mostrando resultados basados en los filtros aplicados</p>
        </div>
        <div className="data-table">
          {/* Aquí iría la tabla de datos filtrados */}
          <p>La tabla de datos se mostrará aquí...</p>
        </div>
      </section>
    </div>
  )
}

export default DataFilteringPage