import React, { useState } from 'react'

const DataVisualizationPage = () => {
  const [chartType, setChartType] = useState('bar')
  const [selectedData, setSelectedData] = useState('dataset1')

  return (
    <div className="data-visualization-page">
      <header className="page-header">
        <h1>Representación de Datos</h1>
        <p>Visualiza tus datos con gráficos interactivos y personalizables</p>
      </header>
      
      <section className="visualization-controls">
        <div className="control-group">
          <label>Tipo de Gráfico:</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="bar">Gráfico de Barras</option>
            <option value="line">Gráfico de Líneas</option>
            <option value="pie">Gráfico Circular</option>
            <option value="scatter">Diagrama de Dispersión</option>
            <option value="area">Gráfico de Área</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Conjunto de Datos:</label>
          <select value={selectedData} onChange={(e) => setSelectedData(e.target.value)}>
            <option value="dataset1">Dataset 1</option>
            <option value="dataset2">Dataset 2</option>
            <option value="dataset3">Dataset 3</option>
          </select>
        </div>
        
        <div className="control-group">
          <button className="generate-chart">Generar Gráfico</button>
          <button className="export-chart">Exportar</button>
        </div>
      </section>
      
      <section className="chart-container">
        <div className="chart-placeholder">
          <h3>Vista Previa del Gráfico</h3>
          <div className="chart-area">
            <p>Aquí se mostrará el gráfico {chartType} para {selectedData}</p>
            {/* Aquí se integraría la librería de gráficos (Chart.js, D3.js, etc.) */}
          </div>
        </div>
      </section>
      
      <section className="chart-options">
        <h3>Opciones de Personalización</h3>
        <div className="options-grid">
          <div className="option-group">
            <label>Título del Gráfico:</label>
            <input type="text" placeholder="Ingresa el título..." />
          </div>
          <div className="option-group">
            <label>Color Principal:</label>
            <input type="color" defaultValue="#007bff" />
          </div>
          <div className="option-group">
            <label>Mostrar Leyenda:</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="option-group">
            <label>Animaciones:</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </section>
    </div>
  )
}

export default DataVisualizationPage