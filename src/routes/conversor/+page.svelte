<script>
    import { onMount, afterUpdate } from 'svelte';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { get } from 'svelte/store';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
  
    let latexCode = '';
    let htmlCode = '';
    let error = '';
    let isLoading = false;
  
    async function convertirLatex() {
    isLoading = true;
    error = '';

    try {
        const token = get(sessionStore).access;

        if (!token) {
            throw new Error('No access token provided');
        }

        const response = await fetch('https://backend.laila.icu/api/convertir/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latex_code: latexCode })
        });


        if (!response.ok) {
            throw new Error('Error converting LaTeX: ' + response.status);
        }

        const data = await response.json();
        htmlCode = data.html_code;
        await renderMathJax();
    } catch (err) {
        console.error("Error en la conversión:", err);
        error = err.message;
    } finally {
        isLoading = false;
    }
}

  
    onMount(() => {
      // Inicializa MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        svg: {
          fontCache: 'global'
        }
      };
  
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      script.onload = () => {
        renderMathJax(); // Asegurarse de que MathJax esté configurado y listo
      };
      document.head.appendChild(script);
    });
  
    afterUpdate(() => {
      if (htmlCode) {
        renderMathJax();
      }
    });
  
    async function renderMathJax() {
    if (window.MathJax) {
        try {
            await window.MathJax.typesetPromise();  // Asegura que MathJax procese cualquier nuevo contenido HTML
        } catch (err) {
            console.error("Error al renderizar MathJax: ", err);
        }
    }
}

    function downloadHtml() {
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted.html';
      link.click();
      URL.revokeObjectURL(url);
    }
  </script>

<main>
    <div class="container">
      <h1 class="title">
        <span class="logo">L<span class="logo-bracket">&#123;</span>H<span class="logo-bracket">&#125;</span></span>
        Convertidor de LaTeX a HTML
      </h1>
  
      <div class="editor">
        <textarea bind:value={latexCode} rows="10" placeholder="Escribe tu código LaTeX aquí..."></textarea>
        <button on:click={convertirLatex} disabled={isLoading}>
          {#if isLoading}
            <div class="spinner"></div>
          {:else}
            Convertir
          {/if}
        </button>
        
      </div>
  
      {#if error}
        <p class="error">{error}</p>
      {/if}
  
      {#if htmlCode}
        <div class="result">
          <div class="mathjax-container">
            {@html htmlCode}
          </div>
        </div>
  
        <div class="html-code-container">
          <h2>Código HTML Convertido</h2>
          <pre class="html-code">{htmlCode}</pre>
          <button class="download-btn" on:click={downloadHtml}>Descargar HTML</button>
        </div>
      {/if}
    </div>
  </main>


  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600&family=Source+Code+Pro&display=swap');
    
    main {
      font-family: 'Fira Sans', sans-serif;
      max-width: 75%;
      margin: 40px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
   
  
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 40px;
      font-weight: 600;
      font-size: 36px;
      position: relative;
      display: inline-block;
      left: 50%;
      transform: translateX(-50%);
    }
  
    .logo {
      color: #ff3e00;
      font-weight: 600;
    }
  
    .logo-bracket {
      color: #40b3ff;
    }
  
    .editor {
      margin-bottom: 30px;
    }
  
    textarea {
      width: 100%;
      font-family: 'Source Code Pro', monospace;
      font-size: 18px;
      padding: 15px;
      box-sizing: border-box;
      border: 2px solid #ddd;
      border-radius: 5px;
      transition: border-color 0.3s ease;
    }
  
    textarea:focus {
      outline: none;
      border-color: #ff3e00;
    }
  
    button {
      display: block;
      width: 100%;
      margin-top: 20px;
      padding: 15px;
      background-color: #ff3e00;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }
  
    button:hover {
      background-color: #e62e00;
    }
  
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-left-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  
    .error {
      color: #ff3e00;
      font-weight: 600;
      margin-bottom: 20px;
    }  
  
    .result {
      padding: 30px;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .mathjax-container {
      font-size: 20px;
      line-height: 1.6;
    }  
    .html-code-container {
      padding: 30px;
      background-color: #f4f4f4;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .html-code-container h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #333;
    }
  
    .html-code {
      font-family: 'Source Code Pro', monospace;
      font-size: 16px;
      line-height: 1.5;
      color: #333;
      overflow-x: auto;
      padding: 10px;
      background-color: #fff;
      border-radius: 5px;
    }
  
    .download-btn {
      display: block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #1a237e;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }
  
    .download-btn:hover {
      background-color: #161d6a;
    }
  </style>