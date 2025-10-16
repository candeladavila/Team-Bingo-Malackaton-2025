import React, { useState, useEffect } from 'react'
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
import { Bar } from 'react-chartjs-2'
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
        case 'histogram':
          endpoint = `http://localhost:8001/api/visualization/age-histogram?diagnosis=${encodeURIComponent(selectedDiagnosis)}`
          break
        case 'gender-bar':
          endpoint = `http://localhost:8001/api/visualization/gender-distribution?diagnosis=${encodeURIComponent(selectedDiagnosis)}`
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
      
      case 'histogram':
        if (!data.age_groups || !data.counts) {
          console.error('Missing required data for histogram chart:', data)
          throw new Error('Datos incompletos para histograma')
        }
        return {
          labels: data.age_groups,
          datasets: [
            {
              label: 'Distribución de Edades',
              data: data.counts,
              backgroundColor: colors.background,
              borderColor: colors.primary,
              borderWidth: 2,
              fill: true,
            }
          ]
        }
      
      case 'gender-bar':
        if (data.male_count === undefined || data.female_count === undefined) {
          console.error('Missing required data for gender bar chart:', data)
          throw new Error('Datos incompletos para distribución por sexo')
        }
        return {
          labels: ['Masculino', 'Femenino'],
          datasets: [
            {
              label: 'Número de Casos',
              data: [data.male_count, data.female_count],
              backgroundColor: [colors.male, colors.female],
              borderColor: [colors.male, colors.female],
              borderWidth: 1,
            }
          ]
        }
      
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

    return baseOptions
  }

  const getChartTitle = () => {
    switch (chartType) {
      case 'pyramid':
        return `Pirámide Poblacional - ${selectedDiagnosis}`
      case 'histogram':
        return `Distribución de Edades - ${selectedDiagnosis}`
      case 'gender-bar':
        return `Distribución por Sexo - ${selectedDiagnosis}`
      default:
        return 'Gráfico'
    }
  }

  return (
    <div className="data-visualization-page">
      <header className="page-header">
        <h1>Representación de Datos</h1>
        <p>Visualiza datos médicos con gráficos interactivos especializados</p>
      </header>
      
      <section className="visualization-controls">
        <div className="control-group">
          <label>Tipo de Visualización:</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="pyramid">Pirámide Poblacional</option>
            <option value="histogram">Histograma de Edades</option>
            <option value="gender-bar">Distribución por Sexo</option>
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
                <Bar data={chartData} options={getChartOptions()} />
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
            <p>Muestra la distribución por año de ingreso y sexo de pacientes con un diagnóstico específico. Los hombres aparecen en azul (lado izquierdo) y las mujeres en morado (lado derecho).</p>
          </div>
          <div className="info-card">
            <h4>Histograma de Edades</h4>
            <p>Representa la distribución normal de las edades de los pacientes filtrados por diagnóstico, mostrando la frecuencia de cada grupo etario.</p>
          </div>
          <div className="info-card">
            <h4>Distribución por Sexo</h4>
            <p>Gráfico de barras que compara el número total de casos entre hombres y mujeres para el diagnóstico seleccionado.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DataVisualizationPage