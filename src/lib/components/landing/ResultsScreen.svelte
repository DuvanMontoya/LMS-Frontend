<script>
    import { createEventDispatcher } from 'svelte';
    import PerformanceAnalysis from './PerformanceAnalysis.svelte';
    
    export let results;
    const dispatch = createEventDispatcher();
  
    function handleRestartClick() {
      dispatch('restart');
    }
  </script>
  
  <div class="results-screen">
    <h1>Resultados Finales</h1>
  
    <PerformanceAnalysis {results} />
  
    <button class="restart-btn" on:click={handleRestartClick}>
      Reiniciar Simulación
    </button>
  </div>
  
  <style>
  .results-screen {
    background: linear-gradient(135deg, #7ED321, #F5A623);
    border-radius: 20px;
    padding: 2rem;
    color: #fff;
    text-align: center;
  }
  .restart-btn {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    background: #fff;
    color: #4A90E2;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s;
  }
  .restart-btn:hover {
    transform: scale(1.05);
  }
  </style>  