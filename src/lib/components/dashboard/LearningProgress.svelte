<!-- src/components/dashboard/LearningProgress.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let cursos = [];
  
    let progressChart;
    let overallProgress = 0;
  
    $: {
      const totalLessons = cursos.reduce((total, curso) => total + curso.total_lecciones, 0);
      const completedLessons = cursos.reduce((total, curso) => total + curso.lecciones_completadas, 0);
      overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      if (progressChart) {
        updateChart();
      }
    }
  
    onMount(() => {
      initChart();
    });
  
    function initChart() {
      const ctx = document.getElementById('learningProgressChart').getContext('2d');
      progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completado', 'Pendiente'],
          datasets: [{
            data: [overallProgress, 100 - overallProgress],
            backgroundColor: ['#4CAF50', '#E0E0E0'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
    }
  
    function updateChart() {
      progressChart.data.datasets[0].data = [overallProgress, 100 - overallProgress];
      progressChart.update();
    }
  </script>
  
  <section class="learning-progress">
    <h2>Progreso de Aprendizaje</h2>
    <div class="progress-chart-container">
      <canvas id="learningProgressChart"></canvas>
      <div class="progress-percentage">{overallProgress.toFixed(1)}%</div>
    </div>
    <div class="progress-details">
      <div class="detail-item">
        <span class="detail-label">Cursos Completados:</span>
        <span class="detail-value">{cursos.filter(c => c.completado).length}/{cursos.length}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Lecciones Completadas:</span>
        <span class="detail-value">
          {cursos.reduce((total, curso) => total + curso.lecciones_completadas, 0)}/
          {cursos.reduce((total, curso) => total + curso.total_lecciones, 0)}
        </span>
      </div>
    </div>
  </section>
  
  <style>
    .learning-progress {
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
  
    .progress-chart-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 2rem;
    }
  
    .progress-percentage {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: bold;
      color: #4CAF50;
    }
  
    .progress-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
    }
  
    .detail-label {
      color: #666;
    }
  
    .detail-value {
      font-weight: bold;
      color: #333;
    }
  </style>