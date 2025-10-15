import React from 'react'

const ToolsPage = () => {
  return (
    <div className="tools-page">
      <header className="page-header">
        <h1>Herramientas</h1>
        <p>Descubre todas las herramientas disponibles para tu análisis</p>
      </header>
      
      <section className="tools-grid">
        <div className="tool-category">
          <h2>Análisis de Datos</h2>
          <div className="tools-list">
            <div className="tool-item">
              <h3>Importar Datos</h3>
              <p>Importa datos desde diferentes fuentes</p>
              <button>Usar Herramienta</button>
            </div>
            <div className="tool-item">
              <h3>Limpiar Datos</h3>
              <p>Limpia y prepara tus datos para análisis</p>
              <button>Usar Herramienta</button>
            </div>
          </div>
        </div>
        
        <div className="tool-category">
          <h2>Estadísticas</h2>
          <div className="tools-list">
            <div className="tool-item">
              <h3>Estadísticas Descriptivas</h3>
              <p>Obtén estadísticas básicas de tus datos</p>
              <button>Usar Herramienta</button>
            </div>
            <div className="tool-item">
              <h3>Correlaciones</h3>
              <p>Analiza correlaciones entre variables</p>
              <button>Usar Herramienta</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ToolsPage