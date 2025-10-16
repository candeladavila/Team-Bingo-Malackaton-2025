import React, { createContext, useContext, useState, useEffect } from 'react';

// Traducciones básicas
const translations = {
  es: {
    title: 'Configuración de Accesibilidad',
    subtitle: 'Personaliza la interfaz según tus necesidades de accesibilidad',
    visualSettings: 'Configuración Visual',
    interactionSettings: 'Configuración de Interacción',
    languageSettings: 'Configuración de Idioma',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    keyboardShortcuts: 'Atajos de Teclado',
    saveSettings: 'Guardar Configuración',
    resetDefaults: 'Restaurar Valores por Defecto',
    // ... más traducciones
  },
  en: {
    title: 'Accessibility Settings',
    subtitle: 'Customize the interface according to your accessibility needs',
    visualSettings: 'Visual Settings',
    interactionSettings: 'Interaction Settings',
    languageSettings: 'Language Settings',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    keyboardShortcuts: 'Keyboard Shortcuts',
    saveSettings: 'Save Settings',
    resetDefaults: 'Reset to Defaults',
    // ... more translations
  }
};

// Atajos de teclado según WCAG
const keyboardShortcuts = {
  navigation: {
    'Tab': 'Move to next focusable element',
    'Shift + Tab': 'Move to previous focusable element',
    'Enter/Space': 'Activate current element',
    'Esc': 'Close modal/popup',
    'Alt + H': 'Go to Home',
    'Alt + S': 'Open Settings',
    'Alt + M': 'Toggle Menu',
    'Alt + L': 'Change Language',
    'Alt + D': 'Toggle Dark Mode'
  }
};

// Animaciones predefinidas - Solo para filtros
const filterTransitions = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2 }
};

const AccessibilityContext = createContext();

// Valores por defecto
const defaultSettings = {
  language: 'es',
  darkMode: false,
  fontSize: 'medium',
  showKeyboardShortcuts: false
};

export const AccessibilityProvider = ({ children }) => {
  // Estado para idioma, tema y otras configuraciones
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved !== null ? saved : defaultSettings.language;
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : defaultSettings.darkMode;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved !== null ? saved : defaultSettings.fontSize;
  });
  
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(defaultSettings.showKeyboardShortcuts);

  // Efecto para guardar configuraciones en localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('fontSize', fontSize);
  }, [language, darkMode, fontSize]);

  // Efecto para aplicar tema oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Traductor helper
  const t = (key) => {
    return translations[language][key] || key;
  };

  // Aplicar el tamaño de fuente
  useEffect(() => {
    document.documentElement.style.fontSize = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    }[fontSize];
  }, [fontSize]);

  const value = {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    t,
    keyboardShortcuts,
    filterTransitions
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};