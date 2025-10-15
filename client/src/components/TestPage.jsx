import React from 'react'

const TestPage = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Página de Prueba</h1>
      <p>Si ves esta página, la navegación está funcionando correctamente.</p>
      <p>URL actual: {window.location.pathname}</p>
    </div>
  )
}

export default TestPage