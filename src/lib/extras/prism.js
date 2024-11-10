export function loadPrism() {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Prism) {
        resolve();
      } else {
        // Cargar PrismJS
        const prismScript = document.createElement('script');
        prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        prismScript.onload = () => {
          // Cargar lenguajes adicionales
          const pythonScript = document.createElement('script');
          pythonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js';
          document.head.appendChild(pythonScript);          
          
  
          // Cargar estilos de PrismJS
          const prismStyle = document.createElement('link');
          prismStyle.rel = 'stylesheet';
          prismStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'; // Usar tema Tomorrow Night
            
          const prismStyleLight = document.createElement('link');
          prismStyleLight.rel = 'stylesheet';
          prismStyleLight.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.css'; // Use the default light theme
          document.head.appendChild(prismStyleLight);
          document.head.appendChild(prismStyle); 
          
  
          pythonScript.onload = resolve;
          pythonScript.onerror = reject;
        };
        prismScript.onerror = reject;
        document.head.appendChild(prismScript);
      }
    });
  }
  