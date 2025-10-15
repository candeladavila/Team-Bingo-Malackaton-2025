import React, { useState } from 'react'

const AccessibilityConfigPage = () => {
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    colorBlindness: 'none',
    animations: true,
    screenReader: false,
    keyboardNavigation: true,
    language: 'es',
    theme: 'light'
  })

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const resetToDefaults = () => {
    setSettings({
      fontSize: 'medium',
      contrast: 'normal',
      colorBlindness: 'none',
      animations: true,
      screenReader: false,
      keyboardNavigation: true,
      language: 'es',
      theme: 'light'
    })
  }

  return (
    <div className="accessibility-config-page">
      <header className="page-header">
        <h1>Configuración de Accesibilidad</h1>
        <p>Personaliza la interfaz según tus necesidades de accesibilidad</p>
      </header>
      
      <section className="config-sections">
        <div className="config-section">
          <h2>👁️ Configuración Visual</h2>
          
          <div className="setting-group">
            <label>Tamaño de Fuente:</label>
            <select 
              value={settings.fontSize} 
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
              <option value="extra-large">Extra Grande</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Contraste:</label>
            <select 
              value={settings.contrast} 
              onChange={(e) => handleSettingChange('contrast', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="high">Alto Contraste</option>
              <option value="extra-high">Contraste Máximo</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Tema:</label>
            <select 
              value={settings.theme} 
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Daltonismo:</label>
            <select 
              value={settings.colorBlindness} 
              onChange={(e) => handleSettingChange('colorBlindness', e.target.value)}
            >
              <option value="none">Ninguno</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </div>
        </div>
        
        <div className="config-section">
          <h2>🎮 Configuración de Interacción</h2>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.animations}
                onChange={(e) => handleSettingChange('animations', e.target.checked)}
              />
              Habilitar Animaciones
            </label>
            <p className="setting-description">
              Desactiva para reducir el movimiento en pantalla
            </p>
          </div>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.keyboardNavigation}
                onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
              />
              Navegación por Teclado Mejorada
            </label>
            <p className="setting-description">
              Mejora los indicadores de foco para navegación por teclado
            </p>
          </div>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.screenReader}
                onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
              />
              Optimización para Lectores de Pantalla
            </label>
            <p className="setting-description">
              Mejora la compatibilidad con tecnologías asistivas
            </p>
          </div>
        </div>
        
        <div className="config-section">
          <h2>🌐 Configuración de Idioma</h2>
          
          <div className="setting-group">
            <label>Idioma de la Interfaz:</label>
            <select 
              value={settings.language} 
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
      </section>
      
      <section className="preview-section">
        <h2>Vista Previa</h2>
        <div className="preview-container" style={{
          fontSize: settings.fontSize === 'large' ? '1.2em' : '1em',
          filter: settings.contrast === 'high' ? 'contrast(150%)' : 'none'
        }}>
          <h3>Ejemplo de texto con la configuración actual</h3>
          <p>
            Este es un texto de ejemplo que muestra cómo se verá la interfaz 
            con tu configuración actual de accesibilidad.
          </p>
          <button>Botón de ejemplo</button>
        </div>
      </section>
      
      <section className="action-buttons">
        <button className="save-button">Guardar Configuración</button>
        <button className="reset-button" onClick={resetToDefaults}>
          Restaurar Valores por Defecto
        </button>
      </section>
      
      <section className="help-section">
        <h2>💡 Ayuda de Accesibilidad</h2>
        <div className="help-content">
          <h3>Atajos de Teclado:</h3>
          <ul>
            <li><kbd>Tab</kbd> - Navegar entre elementos</li>
            <li><kbd>Shift + Tab</kbd> - Navegar hacia atrás</li>
            <li><kbd>Enter</kbd> o <kbd>Espacio</kbd> - Activar botones</li>
            <li><kbd>Esc</kbd> - Cerrar diálogos</li>
            <li><kbd>Alt + H</kbd> - Ir al inicio</li>
          </ul>
          
          <h3>¿Necesitas más ayuda?</h3>
          <p>
            Si tienes necesidades específicas de accesibilidad que no están cubiertas 
            por estas opciones, por favor contáctanos en accesibilidad@teamproject.com
          </p>
        </div>
      </section>
    </div>
  )
}

export default AccessibilityConfigPage