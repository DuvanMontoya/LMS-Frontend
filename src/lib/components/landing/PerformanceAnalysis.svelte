<script>
    export let results = {
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalAnswered: 0,
      finalScore: 0,
      timeUsed: 0,
      averageTime: 0
    };
  
    // Precisión en %
    $: accuracy = results.totalAnswered > 0
      ? (results.correctAnswers / results.totalAnswered) * 100
      : 0;
  </script>
  
  <div class="analysis-card">
    <h2>Análisis de Desempeño</h2>
    <div class="analysis-stats">
      <p><strong>Preguntas respondidas:</strong> {results.totalAnswered}</p>
      <p><strong>Correctas:</strong> {results.correctAnswers}</p>
      <p><strong>Incorrectas:</strong> {results.incorrectAnswers}</p>
      <p><strong>Puntaje total:</strong> {results.finalScore}</p>
      <p><strong>Precisión:</strong> {accuracy?.toFixed(2) ?? 0}%</p>
      <p><strong>Tiempo usado:</strong> {results.timeUsed ?? 0} s</p>
      <p><strong>Tiempo promedio/pregunta:</strong> {results.averageTime?.toFixed(2) ?? 0} s</p>
    </div>
  </div>
  
  <style>
  .analysis-card {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    margin: 1rem auto;
    max-width: 600px;
    color: #333;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  .analysis-card h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #4A90E2;
  }
  .analysis-stats p {
    margin: 0.4rem 0;
    font-size: 1rem;
  }
  .analysis-stats strong {
    color: #333;
  }
  </style>
  