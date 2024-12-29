<script>
    import { onMount, afterUpdate } from 'svelte';
    import Chart from 'chart.js/auto';
    import { getResultadosEvaluacion } from '$lib/api/evaluaciones/evaluaciones';
    import { page } from '$app/stores';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
  
    export let evaluacionId;
  
    let resultados = null;
    let error = null;
    let loading = true;
    let chartInstances = {};
    
    $: authToken = get(sessionStore).access;
  
    const safeNumber = (value, decimals = 2) => {
      const num = parseFloat(value);
      return !isNaN(num) ? num.toFixed(decimals) : 'N/A';
    }
  
    const safePercentage = (value) => {
      const num = parseFloat(value);
      return !isNaN(num) ? `${num.toFixed(2)}%` : 'N/A';
    }
  
    const getNivelDesempeno = (puntaje) => {
      const num = parseFloat(puntaje);
      if (isNaN(num)) return 'N/A';
      if (num >= 80) return 'Alto';
      if (num >= 60) return 'Medio';
      return 'Bajo';
    };
  
    async function cargarResultados() {
      loading = true;
      error = null;
      try {
        resultados = await getResultadosEvaluacion(evaluacionId, authToken);
        if (!resultados || !resultados.mejor_intento) {
          throw new Error('No se recibieron resultados válidos de la API');
        }
      } catch (err) {
        error = err.message || 'Hubo un error al cargar los resultados. Por favor, intenta nuevamente.';
      } finally {
        loading = false;
      }
    }
  
    onMount(() => {
      evaluacionId = $page.params.id;
      cargarResultados();
    });
  
    afterUpdate(() => {
      if (resultados && !loading) {
        initCharts();
      }
    });
  
    function initCharts() {
      if (!resultados) return;
  
      const charts = [
        { id: 'contentChart', data: resultados.rendimiento_por_contenido, type: 'bar', label: 'Rendimiento por Contenido' },
        { id: 'contextChart', data: resultados.rendimiento_por_situacion, type: 'radar', label: 'Rendimiento por Situación' },
      ];
  
      charts.forEach(chart => {
        const canvas = document.getElementById(chart.id);
        if (!canvas) return;
  
        if (chartInstances[chart.id]) {
          chartInstances[chart.id].destroy();
        }
  
        if (!chart.data || Object.keys(chart.data).length === 0) return;
  
        const ctx = canvas.getContext('2d');
        const data = Object.entries(chart.data).map(([key, value]) => ({ x: key, y: value }));
  
        const colors = [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ];
  
        chartInstances[chart.id] = new Chart(ctx, {
          type: chart.type,
          data: {
            labels: data.map(item => item.x),
            datasets: [{
              label: chart.label,
              data: data.map(item => item.y),
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.7', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 12
                },
                padding: 10,
                cornerRadius: 4
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    size: 12
                  }
                }
              },
              x: {
                ticks: {
                  font: {
                    size: 12
                  }
                }
              }
            }
          }
        });
      });
    }
  
    function volverAtras() {
      goto('/evaluaciones/' + evaluacionId);
    }
  </script>
  
  <svelte:head>
    <title>Análisis de Resultados - {resultados?.evaluacion?.titulo || 'Cargando...'}</title>
  </svelte:head>
  
  <div class="container">
    <header>
      <h1>Análisis de Resultados</h1>
      {#if resultados?.evaluacion?.titulo}
        <h2>{resultados.evaluacion.titulo}</h2>
      {/if}
    </header>
  
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando resultados...</p>
      </div>
    {:else if error}
      <div class="error-message">
        <p>{error}</p>
        <button on:click={cargarResultados}>Reintentar</button>
      </div>
    {:else if resultados}
      <section class="score-overview">
        <div class="score-card">
          <h3>Puntaje Global</h3>
          <div class="score">
            {safeNumber(resultados.mejor_intento.puntaje_obtenido)}
          </div>
          <p>Nivel de Desempeño: <span class="nivel">{getNivelDesempeno(resultados.mejor_intento.puntaje_obtenido)}</span></p>
        </div>
        <div class="score-card">
          <h3>Percentil</h3>
          <div class="score">{safeNumber(resultados.percentil)}</div>
          <p>Superaste al {safePercentage(resultados.percentil)} de los estudiantes</p>
        </div>
        <div class="score-card">
          <h3>Puntaje Normalizado</h3>
          <div class="score">{safePercentage(resultados.puntaje_normalizado)}</div>
          <p>Tu rendimiento en una escala de 0 a 100</p>
        </div>
      </section>
  
  
      {#if resultados.rendimiento_por_contenido}
      <section class="content-analysis">
        <h2>Detalle por Contenidos</h2>
        <div class="content-grid">
          {#each Object.entries(resultados.rendimiento_por_contenido) as [contenido, porcentaje]}
            <div class="content-item">
              <h3>{contenido}</h3>
              <div class="progress-container">
                <div class="progress-bar" style="width: {porcentaje}%;"></div>
              </div>
              <div class="content-score">{safePercentage(porcentaje)}</div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  
    <section class="analysis-section">
      <h2>Análisis por Contenidos y Situaciones</h2>
      <div class="charts-container">
        <div class="chart-wrapper">
          <h3>Análisis por Contenidos</h3>
          <div class="chart">
            <canvas id="contentChart"></canvas>
          </div>
        </div>
        <div class="chart-wrapper">
          <h3>Análisis por Situación</h3>
          <div class="chart">
            <canvas id="contextChart"></canvas>
          </div>
        </div>
      </div>
    </section>
  
  
      {#if resultados.competencias && resultados.competencias.length > 0}
        <section class="competency-analysis">
          <h2>Análisis por Competencias</h2>
          <div class="competency-grid">
            {#each resultados.competencias as competencia, i}
              <div class="competency-card">
                <h3>{competencia.nombre}</h3>
                <div class="competency-score">
                  <svg viewBox="0 0 36 36" class="circular-chart">
                    <path class="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="circle"
                      stroke-dasharray="{competencia.puntaje}, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" class="percentage">{safeNumber(competencia.puntaje)}%</text>
                  </svg>
                </div>
                <p class="competency-description">{competencia.descripcion}</p>
              </div>
            {/each}
          </div>
        </section>
      {/if}
  
      
  
      
      
  
      {#if resultados.recomendaciones && resultados.recomendaciones.length > 0}
        <section class="recommendations">
          <h2>Recomendaciones Personalizadas</h2>
          <ul>
            {#each resultados.recomendaciones as recomendacion}
              <li>{recomendacion}</li>
            {/each}
          </ul>
        </section>
      {:else}
        <p class="no-recommendations">No hay recomendaciones disponibles en este momento.</p>
      {/if}
    {/if}
  
    <button class="volver-button" on:click={volverAtras}>Volver a Evaluaciones</button>
  </div>
  
  <style>
    
  
    .container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      color: var(--text-color);
      background-color: var(--background-color);
    }
  
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
  
    h1 {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }
  
    h2 {
      font-size: 2rem;
      /* color: var(--highlight-color); */
      margin-bottom: 1.5rem;
    }
  
    .score-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
  
    .score-card {
      background: var(--card-background);
      border-radius: var(--border-radius);
      padding: 2rem;
      text-align: center;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }
  
    .score-card:hover {
      transform: translateY(-5px);
    }
  
    .score-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  
    .score {
      font-size: 3rem;
      font-weight: 700;
      color: var(--highlight-color);
      margin: 1rem 0;
    }
  
    .analysis-section {
      margin-bottom: 3rem;
    }
  
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }
  
    .chart-wrapper {
      background: var(--card-background);
      border-radius: var(--border-radius);
      padding: 2rem;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }
  
    .chart-wrapper:hover {
      transform: translateY(-5px);
    }
  
    .chart-wrapper h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      text-align: center;
      color: var(--primary-color);
    }
  
    .chart {
      height: 300px;
    }
  
    .competency-analysis {
      margin-bottom: 3rem;
    }
  
    .competency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .competency-card {
      background: var(--card-background);
      border-radius: var(--border-radius);
      padding: 2rem;
      text-align: center;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }
  
    .competency-card:hover {
      transform: translateY(-5px);
    }
  
    .competency-score {
      width: 100px;
      height: 100px;
      margin: 1rem auto;
    }
  
    .circular-chart {
      width: 100%;
      height: 100%;
    }
  
    .circle-bg {
      fill: none;
      stroke: #eee;
      stroke-width: 3.8;
    }
  
    .circle {
      fill: none;
      stroke: var(--highlight-color);
      stroke-width: 2.8;
      stroke-linecap: round;
      animation: progress 1s ease-out forwards;
    }
  
    @keyframes progress {
      0% {
        stroke-dasharray: 0 100;
      }
    }
  
    .percentage {
      fill: var(--text-color);
      font-size: 0.5em;
      text-anchor: middle;
    }
  
    .competency-description {
      font-size: 0.9rem;
      color: #666;
      margin-top: 1rem;
    }
  
    .content-analysis {
      margin-bottom: 3rem;
    }
  
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }
  
    .content-item {
      background: var(--card-background);
      border-radius: var(--border-radius);
      padding: 1rem;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }
  
    .content-item:hover {
      transform: translateY(-5px);
    }
  
    .content-item h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
  
    .progress-container {
      height: 10px;
      background-color: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
  
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--secondary-color), var(--highlight-color));
      border-radius: 5px;
      transition: width 0.5s ease-out;
    }
  
    .content-score {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
      text-align: right;
    }
  
    .recommendations {
      background: var(--card-background);
      border-radius: var(--border-radius);
      padding: 2rem;
      margin-bottom: 3rem;
      box-shadow: var(--card-shadow);
    }
  
    .recommendations ul {
      list-style-type: none;
      padding-left: 0;
    }
  
    .recommendations li {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: rgba(233, 69, 96, 0.1);
      border-radius: 6px;
      font-size: 1rem;
      line-height: 1.6;
    }
  
    .recommendations li:last-child {
      margin-bottom: 0;
    }
  
    .no-recommendations {
      text-align: center;
      font-style: italic;
      color: #666;
    }
  
    .volver-button {
      display: block;
      width: 220px;
      margin: 2rem auto;
      padding: 1rem 1.5rem;
      background-color: var(--highlight-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .volver-button:hover {
      background-color: var(--accent-color);
    }
  
    .loading {
      text-align: center;
      padding: 2rem;
    }
  
    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--highlight-color);
      animation: spin 1s ease-in-out infinite;
      margin: 0 auto 1rem;
    }
  
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  
    .error-message {
      text-align: center;
      color: var(--highlight-color);
      padding: 2rem;
    }
  
    .error-message button {
      margin-top: 1rem;
      padding: 0.8rem 1.2rem;
      background-color: var(--highlight-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
    }
  
    .error-message button:hover {
      background-color: var(--accent-color);
    }
  
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
  
      h1 {
        font-size: 2.5rem;
      }
  
      h2 {
        font-size: 1.8rem;
      }
  
      .score-overview,
      .charts-container,
      .competency-grid,
      .content-grid {
        grid-template-columns: 1fr;
      }
  
      .chart {
        height: 250px;
      }
    }
  </style>