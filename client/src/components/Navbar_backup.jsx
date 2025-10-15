import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const toggleToolsDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Dropdown toggled:', !isToolsDropdownOpen) // Debug
    setIsToolsDropdownOpen(!isToolsDropdownOpen)
  }

  const closeDropdown = () => {
    console.log('Dropdown closed') // Debug
    setIsToolsDropdownOpen(false)
  }

  const handleNavigation = (path) => {
    navigate(path)
    closeDropdown()
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    if (isToolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isToolsDropdownOpen])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Nombre de la web */}
        <div className="navbar-brand">
          <Link to="/" className="brand-button">
            <span className="brand-icon">💡</span>
            <span className="brand-text">Insight</span>
          </Link>
        </div>

        {/* Menú de navegación */}
        <div className="navbar-menu">
          {/* Dropdown de Herramientas */}
          <div className="navbar-item dropdown" ref={dropdownRef}>
            <button 
              className={`dropdown-toggle ${
                ['/tools', '/data-filtering', '/data-visualization', '/chatbot'].some(path => 
                  isActive(path)
                ) ? 'active' : ''
              }`}
              onClick={toggleToolsDropdown}
              aria-expanded={isToolsDropdownOpen}
              type="button"
            >
              Herramientas
              <span className={`dropdown-arrow ${isToolsDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            
            {isToolsDropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to="/tools"
                  className={`dropdown-item ${isActive('/tools') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <span className="item-icon">🛠️</span>
                  Todas las Herramientas
                </Link>
                <Link 
                  to="/data-filtering"
                  className={`dropdown-item ${isActive('/data-filtering') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <span className="item-icon">🔍</span>
                  Filtrado de Datos
                </Link>
                <Link 
                  to="/data-visualization"
                  className={`dropdown-item ${isActive('/data-visualization') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <span className="item-icon">📊</span>
                  Representación Gráfica
                </Link>
                <Link 
                  to="/chatbot"
                  className={`dropdown-item ${isActive('/chatbot') ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <span className="item-icon">🤖</span>
                  Chatbot
                </Link>
              </div>
            )}
          </div>

          {/* Sobre Nosotros */}
          <div className="navbar-item">
            <Link 
              to="/about"
              className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
            >
              Sobre Nosotros
            </Link>
          </div>

          {/* Accesibilidad */}
          <div className="navbar-item">
            <Link 
              to="/accessibility"
              className={`navbar-link accessibility-link ${isActive('/accessibility') ? 'active' : ''}`}
            >
              <span className="item-icon">♿</span>
              Accesibilidad
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar