import React from 'react'

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Ana García",
      role: "Data Scientist",
      description: "Especialista en análisis de datos y machine learning",
      avatar: "👩‍💻"
    },
    {
      name: "Carlos Ruiz",
      role: "Frontend Developer",
      description: "Experto en React y visualización de datos",
      avatar: "👨‍💻"
    },
    {
      name: "María López",
      role: "UX/UI Designer",
      description: "Diseñadora enfocada en experiencia de usuario",
      avatar: "👩‍🎨"
    },
    {
      name: "David Chen",
      role: "Backend Developer",
      description: "Especialista en APIs y arquitectura de sistemas",
      avatar: "👨‍🔧"
    }
  ]

  return (
    <div className="about-page">
      <header className="page-header">
        <h1>Sobre Nosotros</h1>
        <p>Conoce al equipo detrás de esta plataforma de análisis de datos</p>
      </header>
      
      <section className="mission-section">
        <div className="mission-content">
          <h2>Nuestra Misión</h2>
          <p>
            Democratizar el análisis de datos proporcionando herramientas intuitivas y potentes 
            que permitan a cualquier persona extraer insights valiosos de sus datos, sin importar 
            su nivel técnico.
          </p>
        </div>
        
        <div className="vision-content">
          <h2>Nuestra Visión</h2>
          <p>
            Ser la plataforma líder en análisis de datos accesible, donde la tecnología 
            avanzada se encuentra con la simplicidad de uso, empoderando a individuos y 
            organizaciones para tomar decisiones basadas en datos.
          </p>
        </div>
      </section>
      
      <section className="team-section">
        <h2>Nuestro Equipo</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-card">
              <div className="member-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <h4>{member.role}</h4>
              <p>{member.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="values-section">
        <h2>Nuestros Valores</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>🎯 Precisión</h3>
            <p>Nos comprometemos con la exactitud en cada análisis y visualización</p>
          </div>
          <div className="value-card">
            <h3>🌍 Accesibilidad</h3>
            <p>Hacemos que el análisis de datos sea accesible para todos</p>
          </div>
          <div className="value-card">
            <h3>🚀 Innovación</h3>
            <p>Constantemente mejoramos y evolucionamos nuestras herramientas</p>
          </div>
          <div className="value-card">
            <h3>🤝 Colaboración</h3>
            <p>Fomentamos el trabajo en equipo y el intercambio de conocimientos</p>
          </div>
        </div>
      </section>
      
      <section className="contact-section">
        <h2>Contáctanos</h2>
        <div className="contact-info">
          <p>📧 Email: info@teamproject.com</p>
          <p>📱 Teléfono: +1 (555) 123-4567</p>
          <p>📍 Ubicación: Madrid, España</p>
        </div>
        
        <div className="social-links">
          <h3>Síguenos</h3>
          <div className="social-buttons">
            <button>LinkedIn</button>
            <button>Twitter</button>
            <button>GitHub</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage