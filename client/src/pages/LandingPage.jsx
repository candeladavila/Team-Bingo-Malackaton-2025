import React from 'react'
import './LandingPage.css'

const LandingPage = () => {
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
        {/* Elemento principal: Cerebro e Insight */}
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
              
              {/* Copa del árbol realista */}
              <div className="tree-crown">
                <div className="foliage-cluster cluster-center"></div>
                <div className="foliage-cluster cluster-left-top"></div>
                <div className="foliage-cluster cluster-right-top"></div>
                <div className="foliage-cluster cluster-left-middle"></div>
                <div className="foliage-cluster cluster-right-middle"></div>
                <div className="foliage-cluster cluster-top-small"></div>
                
                {/* Más clusters para densidad */}
                <div className="foliage-cluster cluster-extra-1"></div>
                <div className="foliage-cluster cluster-extra-2"></div>
                <div className="foliage-cluster cluster-extra-3"></div>
                <div className="foliage-cluster cluster-extra-4"></div>
                <div className="foliage-cluster cluster-extra-5"></div>
                <div className="foliage-cluster cluster-extra-6"></div>
                <div className="foliage-cluster cluster-extra-7"></div>
                <div className="foliage-cluster cluster-extra-8"></div>
                
                {/* Clusters adicionales para mayor frondosidad */}
                <div className="foliage-cluster cluster-dense-2"></div>
                <div className="foliage-cluster cluster-dense-3"></div>
                <div className="foliage-cluster cluster-dense-5"></div>
                <div className="foliage-cluster cluster-dense-6"></div>
                <div className="foliage-cluster cluster-dense-8"></div>
                
                {/* Clusters centrales para conectar las agrupaciones principales */}
                <div className="foliage-cluster cluster-center-1"></div>
                <div className="foliage-cluster cluster-center-2"></div>
                <div className="foliage-cluster cluster-center-3"></div>
                <div className="foliage-cluster cluster-center-5"></div>
                <div className="foliage-cluster cluster-center-7"></div>
                
                {/* Clusters verticales centrales para forma triangular */}
                <div className="foliage-cluster cluster-vertical-1"></div>
                <div className="foliage-cluster cluster-vertical-2"></div>
                <div className="foliage-cluster cluster-vertical-4"></div>
                <div className="foliage-cluster cluster-vertical-5"></div>
                <div className="foliage-cluster cluster-vertical-6"></div>
                <div className="foliage-cluster cluster-vertical-8"></div>
                <div className="foliage-cluster cluster-vertical-10"></div>
                
                {/* Clusters superiores que sobresalen del centro */}
                <div className="foliage-cluster cluster-peak-1"></div>
                <div className="foliage-cluster cluster-peak-2"></div>
                <div className="foliage-cluster cluster-peak-3"></div>
                <div className="foliage-cluster cluster-peak-4"></div>
                <div className="foliage-cluster cluster-peak-5"></div>
                <div className="foliage-cluster cluster-peak-6"></div>
                
                {/* Clusters adicionales para reforzar el pico izquierdo */}
                <div className="foliage-cluster cluster-left-peak-1"></div>
                <div className="foliage-cluster cluster-left-peak-2"></div>
                <div className="foliage-cluster cluster-left-peak-3"></div>
                <div className="foliage-cluster cluster-left-peak-4"></div>
                
                {/* Hojas individuales dispersas */}
                <div className="scattered-leaves">
                  <div className="leaf-detail leaf-1"></div>
                  <div className="leaf-detail leaf-2"></div>
                  <div className="leaf-detail leaf-3"></div>
                  <div className="leaf-detail leaf-4"></div>
                  <div className="leaf-detail leaf-5"></div>
                  <div className="leaf-detail leaf-6"></div>
                  <div className="leaf-detail leaf-7"></div>
                  <div className="leaf-detail leaf-8"></div>
                  <div className="leaf-detail leaf-9"></div>
                  <div className="leaf-detail leaf-10"></div>
                  <div className="leaf-detail leaf-11"></div>
                  <div className="leaf-detail leaf-12"></div>
                  <div className="leaf-detail leaf-13"></div>
                  <div className="leaf-detail leaf-14"></div>
                  <div className="leaf-detail leaf-15"></div>
                  <div className="leaf-detail leaf-16"></div>
                  <div className="leaf-detail leaf-17"></div>
                  <div className="leaf-detail leaf-18"></div>
                  <div className="leaf-detail leaf-19"></div>
                  <div className="leaf-detail leaf-20"></div>
                </div>
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
            
            {/* Ilustración del cerebro CSS (se oculta automáticamente) */}
            <div className="brain-illustration">
              <div className="brain-connection"></div>
              <div className="brain-glow"></div>
            </div>
            
            {/* Título principal superpuesto */}
            <h1 className="main-title">Insight</h1>
          </div>
          
          {/* Texto introductorio */}
          <p className="intro-text">
            Plataforma de análisis y visualización de datos sobre salud mental
          </p>
        </div>

        {/* Sección "Nuestro objetivo" */}
        <div className="objective-section">
          <div className="content-card">
            <h2>Nuestro objetivo</h2>
            <p>
              Nuestro objetivo es acercar la comprensión de los datos de salud mental 
              a través de herramientas accesibles e intuitivas que permitan a profesionales, 
              investigadores y organizaciones tomar decisiones informadas.
            </p>
          </div>
        </div>

        {/* Sección "Nuestras herramientas" */}
        <div className="tools-section">
          <div className="content-card">
            <h2>Nuestras herramientas</h2>
            <p>
              Explora visualizaciones interactivas, análisis automatizados y comparativas 
              entre comunidades autónomas y categorías clínicas. Descubre patrones, 
              tendencias y insights que impulsen la investigación en salud mental.
            </p>
            <div className="tools-preview">
              <div className="tool-icon">📊</div>
              <div className="tool-icon">🔍</div>
              <div className="tool-icon">🤖</div>
              <div className="tool-icon">⚙️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage