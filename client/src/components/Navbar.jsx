import React, { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false)

  const toggleToolsDropdown = () => {
    setIsToolsDropdownOpen(!isToolsDropdownOpen)
  }

  const closeDropdown = () => {
    setIsToolsDropdownOpen(false)
  }

  const handleNavigation = (path) => {
    // Aquí implementarás la navegación cuando integres React Router
    console.log(`Navegando a: ${path}`)
    closeDropdown()
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Nombre de la web */}
        <div className="navbar-brand">
          <button 
            className="brand-button"
            onClick={() => handleNavigation('/')}
          >
            <span className="brand-icon">💡</span>
            <span className="brand-text">Insight</span>
          </button>
        </div>

        {/* Menú de navegación */}
        <div className="navbar-menu">
          {/* Dropdown de Herramientas */}
          <div className="navbar-item dropdown">
            <button 
              className="dropdown-toggle"
              onClick={toggleToolsDropdown}
              aria-expanded={isToolsDropdownOpen}
            >
              Herramientas
              <span className={`dropdown-arrow ${isToolsDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            
            {isToolsDropdownOpen && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => handleNavigation('/tools')}
                >
                  <span className="item-icon">🛠️</span>
                  Todas las Herramientas
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleNavigation('/data-filtering')}
                >
                  <span className="item-icon">🔍</span>
                  Filtrado de Datos
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleNavigation('/data-visualization')}
                >
                  <span className="item-icon">📊</span>
                  Representación Gráfica
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleNavigation('/chatbot')}
                >
                  <span className="item-icon">🤖</span>
                  Chatbot
                </button>
              </div>
            )}
          </div>

          {/* Sobre Nosotros */}
          <div className="navbar-item">
            <button 
              className="navbar-link"
              onClick={() => handleNavigation('/about')}
            >
              Sobre Nosotros
            </button>
          </div>

          {/* Accesibilidad */}
          <div className="navbar-item">
            <button 
              className="navbar-link accessibility-link"
              onClick={() => handleNavigation('/accessibility')}
            >
              <span className="item-icon">♿</span>
              Accesibilidad
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown al hacer clic fuera */}
      {isToolsDropdownOpen && (
        <div className="dropdown-overlay" onClick={closeDropdown}></div>
      )}
    </nav>
  )
}

export default Navbar