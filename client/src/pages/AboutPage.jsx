import React from 'react'
import './AboutPage.css'
import ListenButton from '../components/ListenButton'  // 👈 Importa el botón


const AboutPage = () => {
  // Placeholder for four team members displayed as circular icons
  const members = Array.from({ length: 4 }).map((_, i) => ({
    id: i + 1,
    name: 'Nombre'
  }))

  return (
    <div className="about-page">
      <ListenButton />  {/* 👈 Añade el botón aquí */}
      <header className="page-header">
        <h1>Sobre Nosotros</h1>
        <p>Conoce al equipo detrás de esta plataforma de análisis de datos</p>
      </header>

      <section className="team-icons-section">
        <div className="icons-row">
          {members.map((m) => (
            <div key={m.id} className="member-block">
              <div className="member-circle" aria-hidden>
                <span className="member-icon">👤</span>
              </div>
              <div className="member-name">{m.name}</div>
              <div className="member-links">
                <a className="icon-btn" href="#" aria-label={`GitHub de ${m.name}`} title="GitHub">
                  {/* GitHub SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 0.5C5.37 0.5 0 5.87 0 12.5C0 17.8 3.44 22.24 8.21 23.8C8.82 23.9 9.02 23.54 9.02 23.22C9.02 22.92 9.01 22.18 9.01 21.26C5.66 21.91 4.97 19.5 4.97 19.5C4.42 18.09 3.63 17.7 3.63 17.7C2.55 16.95 3.72 16.97 3.72 16.97C4.93 17.06 5.55 18.22 5.55 18.22C6.62 19.99 8.33 19.5 9.02 19.2C9.11 18.42 9.4 17.88 9.72 17.56C7.08 17.24 4.34 16.21 4.34 11.53C4.34 10.22 4.79 9.15 5.53 8.32C5.42 8 5.05 6.78 5.63 5.15C5.63 5.15 6.59 4.82 9.01 6.34C9.92 6.06 10.89 5.92 11.86 5.92C12.83 5.92 13.8 6.06 14.71 6.34C17.12 4.82 18.08 5.15 18.08 5.15C18.66 6.78 18.29 8 18.18 8.32C18.92 9.15 19.36 10.22 19.36 11.53C19.36 16.22 16.61 17.24 13.96 17.56C14.37 17.95 14.74 18.7 14.74 19.85C14.74 21.44 14.73 22.78 14.73 23.22C14.73 23.54 14.93 23.91 15.55 23.8C20.32 22.24 23.76 17.8 23.76 12.5C23.76 5.87 18.39 0.5 11.76 0.5H12z"/>
                  </svg>
                </a>
                <a className="icon-btn outline" href="#" aria-label={`LinkedIn de ${m.name}`} title="LinkedIn">
                  {/* LinkedIn SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M20.447 20.452H17.21v-5.569c0-1.328-.026-3.037-1.85-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.006V9h3.068v1.561h.043c.428-.812 1.473-1.667 3.033-1.667 3.244 0 3.846 2.136 3.846 4.913v6.645zM5.337 7.433c-.989 0-1.79-.803-1.79-1.792 0-.99.801-1.793 1.79-1.793.99 0 1.793.803 1.793 1.793 0 .989-.803 1.792-1.793 1.792zM6.814 20.452H3.86V9h2.955v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="history-section">
        <h2>Nuestra historia</h2>
        <p className="history-subtitle">Aquí puedes añadir un breve subtítulo o frase que resuma nuestra historia.</p>
      </section>
    </div>
  )
}

export default AboutPage