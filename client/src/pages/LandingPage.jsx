import React from 'react'

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="hero-section">
        <h1>Bienvenido a Nuestro Proyecto</h1>
        <p>Tu solución integral para análisis y visualización de datos</p>
        <nav className="main-nav">
          <button>Comenzar</button>
        </nav>
      </header>
      
      <section className="features-preview">
        <h2>Características Principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Herramientas Avanzadas</h3>
            <p>Conjunto completo de herramientas para análisis</p>
          </div>
          <div className="feature-card">
            <h3>Filtrado Inteligente</h3>
            <p>Filtra tus datos de manera eficiente</p>
          </div>
          <div className="feature-card">
            <h3>Visualización</h3>
            <p>Representa tus datos de forma visual</p>
          </div>
          <div className="feature-card">
            <h3>Chatbot IA</h3>
            <p>Asistente inteligente para ayudarte</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage