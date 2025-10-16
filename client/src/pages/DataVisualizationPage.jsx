import React, { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import './DataVisualizationPage.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const DataVisualizationPage = () => {
  const [chartType, setChartType] = useState('pyramid')
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('')
  const [diagnoses, setDiagnoses] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Generate decorative background dots (positions and styles randomized)
  const bgDots = useMemo(() => {
    const dots = []
    // Use only lilac/white tones (exclude pure pink) and avoid placing dots over bottom area where cards live
    const colorsPool = [
      'var(--page-bg-end)',
      'rgba(255,255,255,0.22)',
      'rgba(255,255,255,0.14)'
    ]
    for (let i = 0; i < 34; i++) {
      // limit top to avoid lower 30% (where info cards usually are)
      const topPercent = Math.random() * 68 // 0 - 68%
      dots.push({
        id: i,
        top: topPercent,
        left: Math.random() * 100,
        size: 10 + Math.random() * 36,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8,
        color: colorsPool[Math.floor(Math.random() * colorsPool.length)]
      })
    }
    return dots
  }, [])

  // Decorative leaf shapes (SVG paths) positioned around the page
  const bgLeaves = useMemo(() => {
    const leaves = []
    const leafPositions = [
      { top: 6, left: 6, rotate: -20, scale: 0.65 },
      { top: 10, left: 86, rotate: 20, scale: 0.7 },
      { top: 30, left: 6, rotate: -10, scale: 0.6 },
      { top: 26, left: 92, rotate: 15, scale: 0.6 },
      { top: 48, left: 10, rotate: -25, scale: 0.75 },
      { top: 6, left: 50, rotate: 0, scale: 0.5 }
    ]
    leafPositions.forEach((pos, idx) => {
      leaves.push({ id: idx, ...pos })
    })
    return leaves
  }, [])

  // Paleta de colores acorde a tu web
  const colors = {
    primary: '#667eea',
    secondary: '#764ba2',
    male: '#667eea',         // Azul principal para hombres
    female: '#764ba2',       // Morado principal para mujeres
    maleLight: 'rgba(102, 126, 234, 0.8)',   // Azul con transparencia
    femaleLight: 'rgba(118, 75, 162, 0.8)',  // Morado con transparencia
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'rgba(102, 126, 234, 0.1)',
    border: 'rgba(102, 126, 234, 0.3)'
  }

  // Cargar diagnósticos disponibles al montar el componente
  useEffect(() => {
    fetchDiagnoses()
  }, [])

  const fetchDiagnoses = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/filter-options')
      const data = await response.json()
      setDiagnoses(data.diagnosticos || [])
      if (data.diagnosticos && data.diagnosticos.length > 0) {
        setSelectedDiagnosis(data.diagnosticos[0])
      }
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error)
    }
  }

  const generateChart = async () => {
    if (!selectedDiagnosis) {
      alert('Por favor selecciona un diagnóstico')
      return
    }

    setLoading(true)
    try {
      let endpoint = ''
      switch (chartType) {
        case 'pyramid':
          endpoint = `http://localhost:8001/api/visualization/age-pyramid?diagnosis=${encodeURIComponent(selectedDiagnosis)}`
          break
        case 'gender-pie':
          endpoint = `http://localhost:8001/api/visualization/age-pyramid?diagnosis=${encodeURIComponent(selectedDiagnosis)}`
          break
        default:
          break
      }

      console.log('Fetching from endpoint:', endpoint)
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }

      if (data.detail) {
        throw new Error(data.detail)
      }

      const formattedData = formatChartData(data, chartType)
      console.log('Formatted chart data:', formattedData)
      setChartData(formattedData)
    } catch (error) {
      console.error('Error al generar gráfico:', error)
      alert('Error al generar el gráfico: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatChartData = (data, type) => {
    console.log('Formatting data for type:', type, 'Data:', data)
    
    if (!data) {
      console.error('No data received')
      return null
    }

    switch (type) {
      case 'pyramid':
        // Nuevo formato: lista de objetos con {intervalo, hombres, mujeres}
        if (!Array.isArray(data)) {
          console.error('Expected array for pyramid chart:', data)
          throw new Error('Formato de datos incorrecto para pirámide poblacional')
        }
        
        const labels = data.map(item => item.intervalo)
        const maleData = data.map(item => -item.hombres) // Valores negativos para la izquierda
        const femaleData = data.map(item => item.mujeres)
        
        console.log('PYRAMID - Processing', data.length, 'age intervals:', labels)
        
        return {
          labels: labels,
          datasets: [
            {
              label: 'Hombres',
              data: maleData,
              backgroundColor: colors.maleLight,
              borderColor: colors.male,
              borderWidth: 2,
              hoverBackgroundColor: colors.male,
              hoverBorderColor: colors.male,
              hoverBorderWidth: 3,
            },
            {
              label: 'Mujeres',
              data: femaleData,
              backgroundColor: colors.femaleLight,
              borderColor: colors.female,
              borderWidth: 2,
              hoverBackgroundColor: colors.female,
              hoverBorderColor: colors.female,
              hoverBorderWidth: 3,
            }
          ]
        }
      
      case 'gender-pie':
        // Calcular sumatorios de hombres y mujeres
        if (!Array.isArray(data)) {
          console.error('Expected array for pie chart:', data)
          throw new Error('Formato de datos incorrecto para diagrama de sectores')
        }
        
        const totalMales = data.reduce((sum, item) => sum + item.hombres, 0)
        const totalFemales = data.reduce((sum, item) => sum + item.mujeres, 0)
        
        console.log('PIE CHART - Total males:', totalMales, 'Total females:', totalFemales)
        console.log('PIE CHART - Raw data received:', data)
        
        const pieData = {
          labels: ['Hombres', 'Mujeres'],
          datasets: [
            {
              data: [totalMales, totalFemales],
              backgroundColor: [colors.maleLight, colors.femaleLight],
              borderColor: [colors.male, colors.female],
              borderWidth: 2,
              hoverBackgroundColor: [colors.male, colors.female],
              hoverBorderColor: [colors.male, colors.female],
              hoverBorderWidth: 3,
            }
          ]
        }
        
        console.log('PIE CHART - Final pie data:', pieData)
        return pieData
      
      default:
        console.error('Unknown chart type:', type)
        return null
    }
  }

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        title: {
          display: true,
          text: getChartTitle(),
          color: '#333',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#666'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        y: {
          ticks: {
            color: '#666'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        }
      }
    }

    if (chartType === 'pyramid') {
      return {
        ...baseOptions,
        indexAxis: 'y',
        plugins: {
          ...baseOptions.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = Math.abs(context.parsed.x); // Mostrar valor absoluto en tooltip
                return `${label}: ${value} casos`;
              }
            }
          }
        },
        scales: {
          ...baseOptions.scales,
          x: {
            ...baseOptions.scales.x,
            ticks: {
              ...baseOptions.scales.x.ticks,
              callback: function(value) {
                return Math.abs(value) // Mostrar valores absolutos en el eje
              }
            }
          }
        }
      }
    }

    if (chartType === 'gender-pie') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#333',
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: getChartTitle(),
            color: '#333',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} casos (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: {
            bottom: 40
          }
        }
      }
    }

    return baseOptions
  }

  const getChartTitle = () => {
    switch (chartType) {
      case 'pyramid':
        return `Pirámide Poblacional - ${selectedDiagnosis}`
      case 'gender-pie':
        return `Distribución por Sexo - ${selectedDiagnosis}`
      default:
        return 'Gráfico'
    }
  }

  return (
    <div className="data-visualization-page">
      <div className="bg-dots" aria-hidden="true">
        {bgDots.map(dot => (
          <span
            key={`dot-${dot.id}`}
            className="bg-dot"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
              backgroundColor: dot.color
            }}
          />
        ))}

        {bgLeaves.map(leaf => (
          <svg
            key={`leaf-${leaf.id}`}
            className="bg-leaf"
            viewBox="0 0 64 64"
            style={{
              top: `${leaf.top}%`,
              left: `${leaf.left}%`,
              transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg) scale(${leaf.scale})`
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`lg-${leaf.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--page-bg-end)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--page-bg-start)" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path fill={`url(#lg-${leaf.id})`} d="M32 4c6 0 20 8 24 18 4 10-6 24-18 30-12-6-22-20-18-30 4-10 12-18 12-18z" />
          </svg>
        ))}
      </div>
      <header className="page-header">
        <h1>Representación de Datos</h1>
        <p>Visualiza datos médicos con gráficos interactivos especializados</p>
      </header>
      
      <section className="visualization-controls">
        <div className="control-group">
          <label>Tipo de Visualización:</label>
          <select value={chartType} onChange={(e) => {
            setChartType(e.target.value)
            setChartData(null) // Limpiar datos anteriores al cambiar tipo
          }}>
            <option value="pyramid">Pirámide Poblacional</option>
            <option value="gender-pie">Distribución por Sexo (Diagrama de Sectores)</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Diagnóstico:</label>
          <select 
            value={selectedDiagnosis} 
            onChange={(e) => setSelectedDiagnosis(e.target.value)}
          >
            <option value="">Selecciona un diagnóstico</option>
            {diagnoses.map((diagnosis, index) => (
              <option key={index} value={diagnosis}>
                {diagnosis}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <button 
            className="generate-chart"
            onClick={generateChart}
            disabled={loading || !selectedDiagnosis}
          >
            {loading ? 'Generando...' : 'Generar Gráfico'}
          </button>
        </div>
      </section>
      
      <section className="chart-container">
        <div className="chart-placeholder">
          <div className="chart-area">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Generando visualización...</p>
              </div>
            ) : chartData ? (
              <div className="chart-wrapper">
                {chartType === 'pyramid' ? (
                  <Bar key={`pyramid-${selectedDiagnosis}`} data={chartData} options={getChartOptions()} />
                ) : chartType === 'gender-pie' ? (
                  <Pie key={`pie-${selectedDiagnosis}`} data={chartData} options={getChartOptions()} />
                ) : null}
              </div>
            ) : (
              <div className="no-chart">
                <h3>Vista Previa del Gráfico</h3>
                <p>Selecciona un diagnóstico y tipo de visualización, luego haz clic en "Generar Gráfico"</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section className="chart-info">
        <div className="info-cards">
          <div className="info-card">
            <h4>Pirámide Poblacional</h4>
            <p>Muestra la distribución por intervalos de edad y sexo de pacientes con un diagnóstico específico. Los hombres aparecen en azul (lado izquierdo) y las mujeres en morado (lado derecho).</p>
          </div>
          <div className="info-card">
            <h4>Distribución por Sexo</h4>
            <p>Diagrama de sectores que muestra la proporción total de hombres y mujeres con un diagnóstico específico. Se calculan los sumatorios totales de cada género a partir de todos los intervalos de edad.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DataVisualizationPage