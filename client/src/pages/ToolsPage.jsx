import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ToolsPage.css'

const ToolsPage = () => {
  const navigate = useNavigate()

  const handleNavigation = (tool) => {
    switch(tool) {
      case 'filtrado':
        navigate('/data-filtering')
        break
      case 'representacion':
        navigate('/data-visualization')
        break
      default:
        break
    }
  }

  return (
    <div className="tools-page">
      {/* Elementos animados de fondo */}
      <div className="animated-background">
        {/* Hojas animadas */}
        <div className="floating-leaves">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`leaf-${i}`} className={`floating-leaf leaf-${i + 1}`}></div>
          ))}
        </div>
        
        {/* Hojas estáticas */}
        <div className="static-leaves">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`static-leaf-${i}`} className={`static-leaf static-leaf-${i + 1}`}></div>
          ))}
        </div>
        
        {/* Elementos pulsantes */}
        <div className="pulsing-elements">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`pulse-${i}`} className={`pulsing-element pulse-${i + 1}`}></div>
          ))}
        </div>
        
        {/* Puntos animados */}
        <div className="floating-dots">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={`dot-${i}`} className={`floating-dot dot-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <header className="tools-header">
        <h1>Herramientas</h1>
        <p className="tools-subtitle">
          Analiza, visualiza y comprende los datos de salud mental con nuestras herramientas de filtrado y gráficos interactivos.
        </p>
      </header>

      {/* Tres rectángulos blancos */}
      <section className="rectangles-container">
        <div className="white-rectangle">
          <h3 className="tool-title">Filtrado de Datos</h3>
          <div className="tool-icon-container">
            <span className="tool-icon">🔍</span>
          </div>
          <button 
            className="tool-button"
            onClick={() => handleNavigation('filtrado')}
          >
            Prueba aquí
          </button>
        </div>
        
        <div className="white-rectangle">
          <h3 className="tool-title">Representación de Datos</h3>
          <div className="tool-icon-container">
            <span className="tool-icon">📊</span>
          </div>
          <button 
            className="tool-button"
            onClick={() => handleNavigation('representacion')}
          >
            Prueba aquí
          </button>
        </div>
        
        {/* Chatbot tool removed per project requirements */}
      </section>

      {/* Silueta del bosque */}
      <div className="forest-silhouette">
        <div className="tree tree-1"></div>
        <div className="tree tree-2"></div>
        <div className="tree tree-3"></div>
        <div className="tree tree-4"></div>
        <div className="tree tree-5"></div>
        <div className="tree tree-6"></div>
        <div className="tree tree-7"></div>
        <div className="tree tree-8"></div>
        <div className="tree tree-9"></div>
        <div className="tree tree-10"></div>
        <div className="tree tree-11"></div>
        <div className="tree tree-12"></div>
        <div className="tree tree-13"></div>
        <div className="tree tree-14"></div>
        <div className="tree tree-15"></div>
        <div className="tree tree-16"></div>
        <div className="tree tree-17"></div>
        <div className="tree tree-18"></div>
        <div className="tree tree-19"></div>
        <div className="tree tree-20"></div>
        <div className="tree tree-21"></div>
        <div className="tree tree-22"></div>
        <div className="tree tree-23"></div>
        <div className="tree tree-24"></div>
        <div className="tree tree-25"></div>
        <div className="tree tree-26"></div>
        <div className="tree tree-27"></div>
      </div>
    </div>
  )
}

export default ToolsPage