<!-- src/components/dashboard/PerformanceAnalytics.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let evaluaciones = [];
  
    let performanceChart;
  
    onMount(() => {
      initChart();
    });
  
    function initChart() {
      const ctx = document.getElementById('performanceChart').getContext('2d');
      const recentEvaluations = evaluaciones
        .filter(e => e.completada)
        .sort((a, b) => new Date(b.fecha_realizacion) - new Date(a.fecha_realizacion))
        .slice(0, 5)
        .reverse();
  
      performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: recentEvaluations.map(e => e.titulo),
          datasets: [{
            label: 'Calificación',
            data: recentEvaluations.map(e => e.calificacion),
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Calificación (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Evaluaciones'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Calificación: ${context.parsed.y}%`;
                }
              }
            }
          }
        }
      });
    }
  
    function calculateAverageScore() {
      const completedEvaluations = evaluaciones.filter(e => e.completada);
      if (completedEvaluations.length === 0) return 0;
      const totalScore = completedEvaluations.reduce((sum, e) => sum + e.calificacion, 0);
      return (totalScore / completedEvaluations.length).toFixed(1);
    }
  </script>
  
  <section class="performance-analytics">
    <h2>Análisis de Rendimiento</h2>
    
    <div class="performance-summary">
      <div class="summary-item">
        <span class="summary-label">Evaluaciones Completadas</span>
        <span class="summary-value">{evaluaciones.filter(e => e.completada).length}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Calificación Promedio</span>
        <span class="summary-value">{calculateAverageScore()}%</span>
      </div>
    </div>
  
    <div class="performance-chart">
      <canvas id="performanceChart"></canvas>
    </div>
  
    <a href="/evaluaciones" class="view-all-evaluations">Ver todas las evaluaciones</a>
  </section>
  
  <style>
    .performance-analytics {
      background-color: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
  
    h2 {
      font-size: 1.5rem;
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
  
    .performance-summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: 2rem;
    }
  
    .summary-item {
      text-align: center;
    }
  
    .summary-label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
  
    .summary-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2196F3;
    }
  
    .performance-chart {
      margin-bottom: 1.5rem;
    }
  
    .view-all-evaluations {
      display: block;
      text-align: center;
      color: #2196F3;
      text-decoration: none;
      font-weight: 500;
    }
  
    .view-all-evaluations:hover {
      text-decoration: underline;
    }
  </style>