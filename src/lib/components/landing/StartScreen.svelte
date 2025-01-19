<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    function handleStartClick() {
      // Disparamos un evento para notificar al padre
      dispatch('startExam');
    }
  </script>
  
  <div class="start-screen">
    <h1 class="title">Bienvenido(a) al Simulador Premium UNAL</h1>
    <p class="subtitle">
      Nuestro sistema avanzado replica con precisión el examen de admisión.
      Pulsa <strong>"Iniciar Simulación"</strong> para comenzar.
    </p>
  
    <button class="start-button" on:click={handleStartClick}>
      Iniciar Simulación
    </button>
  </div>
  
  <style>
  .start-screen {
    background: linear-gradient(135deg, #4A90E2, #50E3C2);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    color: #fff;
    margin-bottom: 2rem;
  }
  .title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: bold;
  }
  .subtitle {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  .start-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    background: #fff;
    color: #4A90E2;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
  .start-button:hover {
    transform: scale(1.05);
    background: #E8F5E9; /* Un ligero verde pálido */
  }
  </style>  