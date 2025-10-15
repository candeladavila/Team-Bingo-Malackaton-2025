# Cómo añadir tu imagen personalizada del cerebro

## Pasos para añadir tu imagen:

1. **Guarda tu imagen** en esta carpeta (`client/src/assets/`) con el nombre que prefieras, por ejemplo:
   - `brain-image.png`
   - `cerebro.svg`
   - `brain.jpg`
   - etc.

2. **Modifica el archivo LandingPage.jsx** ubicado en `client/src/pages/LandingPage.jsx`:
   
   Busca esta línea (aproximadamente línea 26):
   ```jsx
   {/* <img src="/src/assets/brain-image.png" alt="Brain" /> */}
   ```
   
   Y cámbiala por:
   ```jsx
   <img src="/src/assets/TU_NOMBRE_DE_IMAGEN.png" alt="Brain" />
   ```

3. **Añade la clase CSS** para ocultar la ilustración CSS del cerebro:
   
   En la línea del `<div className="brain-container">`, cámbiala a:
   ```jsx
   <div className="brain-container has-custom-image">
   ```

## Ejemplo completo:

Si tu imagen se llama `cerebro.png`, el código quedaría así:

```jsx
<div className="brain-container has-custom-image">
  <div className="brain-image-container">
    <img src="/src/assets/cerebro.png" alt="Brain" />
  </div>
  
  {/* La ilustración CSS se ocultará automáticamente */}
  <div className="brain-illustration">
    ...
  </div>
  
  <h1 className="main-title">Insight</h1>
</div>
```

## Características recomendadas para la imagen:

- **Formato**: PNG con fondo transparente (recomendado), SVG, o JPG
- **Tamaño**: Entre 400x300px y 800x600px
- **Estilo**: Imagen sin fondo o con fondo transparente para mejor integración
- **Calidad**: Alta resolución para que se vea bien en pantallas retina

## Resultado:

Una vez que añadas tu imagen, el texto "Insight" aparecerá superpuesto sobre tu imagen personalizada, sin animaciones, con solo la primera letra en mayúscula.