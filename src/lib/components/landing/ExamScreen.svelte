<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import QuestionItem from './QuestionItem.svelte';
  
    export let questions = [];
    const dispatch = createEventDispatcher();
  
    // Tiempo total (3h = 10800 s)
    let timer = 10800;
    let isRunning = false;
  
    // Estado general del examen
    let currentQuestionIndex = 0;
    let selectedAnswers = {}; // { [index]: 'a'/'b'/'c'/'d' }
    let answered = new Set();
    let correctCount = 0;
    let incorrectCount = 0;
    let score = 0;
  
    // Estadísticas de tiempo
    let totalAttempts = 0;
    let averageTimePerQuestion = 0;
  
    onMount(() => {
      // Iniciar temporizador apenas montemos
      startTimer();
    });
  
    function startTimer() {
      isRunning = true;
      const interval = setInterval(() => {
        if (timer > 0 && isRunning) {
          timer--;
          if (totalAttempts > 0) {
            averageTimePerQuestion = (10800 - timer) / totalAttempts;
          }
        } else {
          clearInterval(interval);
          if (timer === 0) finishExam();
        }
      }, 1000);
    }
  
    function stopTimer() {
      isRunning = false;
    }
  
    // Formatear tiempo hh:mm:ss
    $: hours = Math.floor(timer / 3600);
    $: minutes = Math.floor((timer % 3600) / 60);
    $: seconds = timer % 60;
    $: formattedTime = `${hours.toString().padStart(2,'0')}:
                        ${minutes.toString().padStart(2,'0')}:
                        ${seconds.toString().padStart(2,'0')}`;
  
    // Evento: selecciona respuesta
    function handleSelectAnswer(answerId) {
      if (!answered.has(currentQuestionIndex)) {
        selectedAnswers[currentQuestionIndex] = answerId;
        answered.add(currentQuestionIndex);
        totalAttempts++;
  
        const question = questions[currentQuestionIndex];
        // Ver si es correcta
        if (answerId === question.correct) {
          correctCount++;
          score += getQuestionScore(question.difficulty);
        } else {
          incorrectCount++;
        }
      }
      // Forzamos mostrar explicación
      questions[currentQuestionIndex].showExplanation = true;
    }
  
    // Calcular puntaje según dificultad
    function getQuestionScore(difficulty) {
      const base = 10;
      const factor = {
        'Baja': 1,
        'Media': 1.5,
        'Alta': 2
      };
      return base * (factor[difficulty] || 1);
    }
  
    // Ir a la siguiente pregunta
    function nextQuestion() {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
      } else {
        finishExam();
      }
    }
  
    // Terminar examen
    function finishExam() {
      stopTimer();
      dispatch('finishExam', {
  correctAnswers: correctCount,
  incorrectAnswers: incorrectCount,
  totalAnswered: totalAttempts,
  finalScore: score,
  timeUsed: 10800 - timer,
  averageTime: averageTimePerQuestion ?? 0  // <-- asegúrate de asignar un número real
});
    }
  
    // Botón "Terminar ya"
    function handleTerminate() {
      finishExam();
    }
  </script>
  
  <div class="exam-screen" in:fade>
    <header class="exam-header">
      <div class="timer">
        <span class="timer-icon">⏱️</span>
        <strong>{formattedTime}</strong>
      </div>
      <div class="stats">
        <span>Pregunta {currentQuestionIndex + 1} / {questions.length}</span>
        <span>✓ {correctCount} | ✗ {incorrectCount}</span>
        <span>Puntaje: {score}</span>
      </div>
    </header>
  
    <!-- Sección de la pregunta actual -->
    <div class="question-container" in:slide>
      <QuestionItem
        question={questions[currentQuestionIndex]}
        on:selectAnswer={handleSelectAnswer}
        selectedAnswer={selectedAnswers[currentQuestionIndex]}
      />
  
      <!-- Botones de navegación -->
      <div class="exam-actions">
        <!-- Solo mostramos "Verificar" si no se ha visto la explicación -->
        {#if !questions[currentQuestionIndex].showExplanation}
          <button
            class="primary-btn"
            on:click={() => {
              // Forzamos ver la explicación solo si ya seleccionó algo
              if (selectedAnswers[currentQuestionIndex]) {
                questions[currentQuestionIndex].showExplanation = true;
              }
            }}
            disabled={!selectedAnswers[currentQuestionIndex]}
          >
            Verificar Respuesta
          </button>
        {:else}
          <button class="primary-btn" on:click={nextQuestion}>
            Siguiente Pregunta →
          </button>
        {/if}
  
        <button class="danger-btn" on:click={handleTerminate}>
          Terminar Examen
        </button>
      </div>
    </div>
  </div>
  
  <style>
  .exam-screen {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    position: relative;
    margin-top: 1rem;
  }
  .exam-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .timer {
    font-size: 1.25rem;
    color: #4A90E2;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .timer-icon {
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); opacity:1; }
    50% { transform: scale(1.15); opacity:0.7; }
  }
  .stats {
    display: flex;
    gap: 2rem;
    align-items: center;
    font-size: 1rem;
    color: #333;
    font-weight: bold;
  }
  .question-container {
    margin-top: 1rem;
  }
  .exam-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  .primary-btn {
    padding: 0.8rem 1.5rem;
    background: #4A90E2;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s, background 0.3s;
  }
  .primary-btn:hover {
    background: #50E3C2;
    transform: scale(1.03);
  }
  .danger-btn {
    padding: 0.8rem 1.5rem;
    background: #D0021B;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s, background 0.3s;
  }
  .danger-btn:hover {
    background: #F5A623;
    transform: scale(1.03);
  }
  </style>
  