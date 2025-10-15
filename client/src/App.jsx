import React, { useState } from 'react'
import { Navbar } from './components'
import { LandingPage } from './pages'
import './App.css'
import './styles/pages.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage />
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
