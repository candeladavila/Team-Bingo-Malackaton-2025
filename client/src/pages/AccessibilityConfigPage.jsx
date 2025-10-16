import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import './AccessibilityConfigPage.css';
import ListenButton from '../components/ListenButton';  // 👈 Importa el botón

const AccessibilityConfigPage = () => {
  const {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    t,
    keyboardShortcuts,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  } = useAccessibility();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  // Restaurar valores por defecto
  const resetToDefaults = () => {
    // Primero limpiamos el localStorage
    localStorage.removeItem('language');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('fontSize');
    
    // Luego actualizamos los estados en orden
    setShowKeyboardShortcuts(false);
    setDarkMode(false);
    setFontSize('medium');
    setLanguage('es');  // El idioma al final para asegurar que las traducciones se actualicen correctamente
    
    // Forzamos la actualización del documento
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.style.fontSize = '16px';
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            setLanguage(prev => prev === 'es' ? 'en' : 'es');
            break;
          case 'd':
            setDarkMode(prev => !prev);
            break;
          case 'k':
            setShowKeyboardShortcuts(prev => !prev);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setLanguage, setDarkMode, setShowKeyboardShortcuts]);

  return (
    <div className="accessibility-config-page">
      <ListenButton />  {/* 👈 Añade el botón aquí */}
      <header className="page-header">
        <h1>Configuración de Accesibilidad</h1>
        <p>{t('subtitle')}</p>
      </header>
      
      <section className="config-sections">
        {/* Configuración de idioma */}
        <div className="config-section">
          <h2>Configuración de idioma</h2>
          <div className="font-size-buttons">
            <button
              className={`font-size-button ${language === 'es' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('es')}
            >
              Español
            </button>
            <button
              className={`font-size-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
          </div>
        </div>

        {/* Configuración de modo oscuro */}
        <div className="config-section">
          <h2>Configuración de modo oscuro</h2>
          <div className="dark-mode-toggle">
            <label className="toggle">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Tamaño de letra */}
        <div className="config-section">
          <h2>Tamaño de letra</h2>
          <div className="font-size-buttons">
            <button
              className={`font-size-button ${fontSize === 'small' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('small')}
              style={{ fontSize: '14px' }}
            >
              Pequeño
            </button>
            <button
              className={`font-size-button ${fontSize === 'medium' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('medium')}
              style={{ fontSize: '16px' }}
            >
              Mediano
            </button>
            <button
              className={`font-size-button ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('large')}
              style={{ fontSize: '18px' }}
            >
              Grande
            </button>
            <button
              className={`font-size-button ${fontSize === 'extra-large' ? 'active' : ''}`}
              onClick={() => handleFontSizeChange('extra-large')}
              style={{ fontSize: '20px' }}
            >
              Muy Grande
            </button>
          </div>
        </div>

        {/* Atajos de teclado */}
        <div className="config-section">
          <h2>Atajos de teclado</h2>
          <button onClick={toggleKeyboardShortcuts}>
            {showKeyboardShortcuts ? 'Ocultar atajos' : 'Mostrar atajos'}
          </button>

          {showKeyboardShortcuts && (
            <div className="keyboard-shortcuts-dropdown">
              {Object.entries(keyboardShortcuts.navigation).map(([key, description]) => (
                <div key={key} className="keyboard-shortcut-item">
                  <kbd>{key}</kbd>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      <section className="action-buttons">
        <button className="reset-button" onClick={resetToDefaults}>
          {t('resetDefaults')}
        </button>
      </section>
    </div>
  )
}

export default AccessibilityConfigPage