import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()

  const navigateToDataVisualization = () => {
    navigate('/data-visualization', { replace: false })
    // Asegurar que la página se muestre desde el principio
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const navigateToDataFiltering = () => {
    navigate('/data-filtering', { replace: false })
    // Asegurar que la página se muestre desde el principio
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const navigateToChatbot = () => {
    navigate('/chatbot', { replace: false })
    // Asegurar que la página se muestre desde el principio
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="landing-page">
      {/* Puntos animados de fondo */}
      <div className="animated-dots">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={`animated-dot-${i}`} className={`animated-dot dot-${i + 1}`}></div>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`animated-dot-color-${i}`} className={`animated-dot dot-color-${i + 1}`}></div>
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`animated-dot-extra-${i}`} className={`animated-dot dot-extra-${i + 1}`}></div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="main-content-landing">
        {/* Elemento principal: Arbol e Insight */}
        <div className="hero-section-landing">
          <div className="brain-container has-custom-image">
            {/* Árbol animado con hojas cayendo */}
            <div className="tree-animation">
              {/* Tronco del árbol */}
              <div className="tree-trunk">
                <div className="trunk-section trunk-base"></div>
                <div className="trunk-section trunk-middle"></div>
                <div className="trunk-section trunk-top"></div>
                <div className="trunk-texture"></div>
              </div>
              
              {/* Copa del árbol realista - Forma ovalada */}
              <div className="tree-crown">
                {/* Cluster central principal */}
                <div className="foliage-cluster cluster-center-main"></div>
                
                {/* Clusters superiores para la parte alta del óvalo */}
                <div className="foliage-cluster cluster-top-left"></div>
                <div className="foliage-cluster cluster-top-center"></div>
                <div className="foliage-cluster cluster-top-right"></div>
                <div className="foliage-cluster cluster-top-far-left"></div>
                <div className="foliage-cluster cluster-top-far-right"></div>
                <div className="foliage-cluster cluster-top-edge-left"></div>
                <div className="foliage-cluster cluster-top-edge-right"></div>
                <div className="foliage-cluster cluster-top-border-center"></div>
                
                {/* Clusters medios para la parte más ancha del óvalo */}
                <div className="foliage-cluster cluster-middle-left"></div>
                <div className="foliage-cluster cluster-middle-right"></div>
                <div className="foliage-cluster cluster-middle-far-left"></div>
                <div className="foliage-cluster cluster-middle-far-right"></div>
                <div className="foliage-cluster cluster-middle-center-left"></div>
                <div className="foliage-cluster cluster-middle-center-right"></div>
                
                {/* Clusters de relleno para densidad ovalada */}
                <div className="foliage-cluster cluster-fill-1"></div>
                <div className="foliage-cluster cluster-fill-2"></div>
                <div className="foliage-cluster cluster-fill-7"></div>
                <div className="foliage-cluster cluster-fill-8"></div>
                
                {/* Clusters adicionales para perfeccionar la forma ovalada */}
                <div className="foliage-cluster cluster-oval-1"></div>
                <div className="foliage-cluster cluster-oval-2"></div>
                <div className="foliage-cluster cluster-oval-3"></div>
                <div className="foliage-cluster cluster-oval-4"></div>
                <div className="foliage-cluster cluster-oval-5"></div>
                <div className="foliage-cluster cluster-oval-6"></div>
                <div className="foliage-cluster cluster-oval-7"></div>
                <div className="foliage-cluster cluster-oval-8"></div>
                
                {/* Clusters de transición copa-tronco */}
                <div className="foliage-cluster cluster-transition-1"></div>
                <div className="foliage-cluster cluster-transition-2"></div>
                <div className="foliage-cluster cluster-transition-3"></div>
                
                {/* Clusters adicionales para eliminar huecos */}
                <div className="foliage-cluster cluster-gap-fill-1"></div>
                <div className="foliage-cluster cluster-gap-fill-2"></div>
                <div className="foliage-cluster cluster-gap-fill-3"></div>
                <div className="foliage-cluster cluster-gap-fill-4"></div>
                <div className="foliage-cluster cluster-gap-fill-7"></div>
              </div>
              
              {/* Hojas cayendo */}
              <div className="falling-leaves">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`leaf-${i}`} className={`falling-leaf leaf-${i + 1}`}></div>
                ))}
              </div>
              
              {/* Hojas en el suelo */}
              <div className="ground-leaves">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={`ground-leaf-${i}`} className={`ground-leaf ground-leaf-${i + 1}`}></div>
                ))}
              </div>
              
              {/* Efectos de viento */}
              <div className="wind-effects">
                <div className="wind-gust gust-1"></div>
                <div className="wind-gust gust-2"></div>
                <div className="wind-gust gust-3"></div>
              </div>
            </div>
            
            {/* Título principal superpuesto */}
            <h1 className="main-title">Insight </h1>
          </div>
          
          {/* Texto introductorio */}
          <p className="intro-text">
             Transformando datos en conocimiento para comprender mejor la mente humana.
          </p>
        </div>

        {/* Separador horizontal */}
        <div className="horizontal-separator"></div>

        {/* Sección "Nuestro objetivo" */}
        <div className="objective-section">
          <div className="content-card">
            <h2>Nuestro objetivo 🔍</h2>
            <p>
              Nuestro objetivo es acercar la comprensión de los datos de salud mental mediante herramientas de inteligencia artificial y visualización accesibles, intuitivas y seguras.
              Buscamos facilitar el trabajo de profesionales, investigadores y organizaciones, promoviendo un uso ético y responsable de los datos clínicos reales
            </p>
          </div>
        </div>

        {/* Sección "Nuestras herramientas" */}
        <div className="tools-section">
          <div className="content-card">
            <h2>Nuestras herramientas 🧰</h2>
            <p>
              Explora visualizaciones interactivas y análisis comparativos entre comunidades autónomas, categorías clínicas y tendencias temporales.
Nuestra plataforma combina visualización avanzada, pensamiento analítico y modelos de IA para extraer insights relevantes que impulsen la investigación en salud mental.
            </p>
            <div className="tools-preview">
              <div 
                className="tool-icon clickable" 
                onClick={navigateToDataFiltering}
                title="Filtrado de Datos"
              >
                🔍
              </div>
              <div 
                className="tool-icon clickable" 
                onClick={navigateToDataVisualization}
                title="Visualización de Datos"
              >
                📊
              </div>
              <div 
                className="tool-icon clickable" 
                onClick={navigateToChatbot}
                title="Chatbot IA"
              >
                🤖
              </div>
            </div>
          </div>
        </div>

        {/* Sección "Compromiso ético y social" */}
        <div className="ethics-section">
          <div className="content-card">
            <h2>Compromiso ético y social 🤝</h2>
            <p>
              En Insight creemos que la tecnología debe servir al bienestar colectivo.
              Por ello, garantizamos la anonimización de los datos, el respeto por la privacidad de los pacientes y el uso responsable de la inteligencia artificial en el análisis de salud mental.
            </p>
          </div>
        </div>

        {/* Espacio entre secciones */}
        <div className="section-spacer"></div>

        {/* Sección "Malackathon 2025" */}
        <div className="malackathon-section">
          <div className="content-card">
            <h2>Malackathon 2025 🚀</h2>
            <p>
              Proyecto desarrollado en el marco del Malackathon 2025, con el propósito de aplicar ciencia de datos e IA al análisis de ingresos hospitalarios en salud mental.
            </p>
          </div>
        </div>

        {/* Espacio inferior */}
        <div className="bottom-spacer"></div>
      </div>
    </div>
  )
}

export default LandingPage