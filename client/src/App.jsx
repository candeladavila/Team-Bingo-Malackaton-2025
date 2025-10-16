import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components'
import { 
  LandingPage, 
  ToolsPage, 
  DataFilteringPage, 
  DataVisualizationPage, 
  
  AboutPage, 
  AccessibilityConfigPage 
} from './pages'
import './App.css'
import './styles/pages.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/data-filtering" element={<DataFilteringPage />} />
            <Route path="/data-visualization" element={<DataVisualizationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/accessibility" element={<AccessibilityConfigPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
