<script>
    import { fade, slide } from 'svelte/transition';
    import MathRenderer from './MathRenderer.svelte';
    import { createEventDispatcher } from 'svelte';
  
    export let question;
    export let selectedAnswer = null;
  
    const dispatch = createEventDispatcher();
  
    function handleOptionClick(answerId) {
      dispatch('selectAnswer', answerId);
    }
  </script>
  
  <div class="question-item" in:fade>
    <!-- Meta -->
    <div class="question-meta">
      <div class="meta-item">
        <span>📚 {question.subject}</span>
      </div>
      <div class="meta-item">
        <span>🎯 {question.area}</span>
      </div>
      <div class="meta-item">
        <span>📋 {question.topic}</span>
      </div>
      <div class="meta-item">
        <span>⭐ {question.difficulty}</span>
      </div>
    </div>
  
    <!-- Contexto -->
    {#if question.context}
      <div class="question-context" in:fade>
        {question.context}
      </div>
    {/if}
  
    <!-- Texto principal con Math -->
    <div class="question-text">
      <MathRenderer expression={question.text} />
    </div>
  
    <!-- Opciones -->
    <div class="options-grid">
      {#each question.options as opt}
        <button
          class="
            option-btn
            {selectedAnswer === opt.id ? 'selected' : ''}
            {question.showExplanation && opt.id === question.correct ? 'correct' : ''}
            {question.showExplanation && selectedAnswer === opt.id && opt.id !== question.correct ? 'incorrect' : ''}
          "
          on:click={() => handleOptionClick(opt.id)}
          disabled={question.showExplanation}
        >
          <span class="option-label">{opt.id.toUpperCase()}</span>
          <span>{opt.text}</span>
        </button>
      {/each}
    </div>
  
    <!-- Explicación -->
    {#if question.showExplanation}
      <div class="explanation-panel" in:slide>
        <h3 class="exp-title">
          {selectedAnswer === question.correct ? '¡Correcto!' : 'Incorrecto...'}
        </h3>
        <div class="exp-body">
          <MathRenderer expression={question.explanation} />
        </div>
        {#if question.hint}
          <div class="hint">
            <span class="hint-icon">💡</span> {question.hint}
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <style>
  .question-item {
    background: #fff;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
  }
  .question-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: #555;
  }
  .question-context {
    background: #f9f9f9;
    border-left: 4px solid #50E3C2;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  .question-text {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    line-height: 1.4;
    color: #333;
  }
  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .option-btn {
    background: #fafafa;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    text-align: left;
    transition: all 0.3s;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    color: #333;
  }
  .option-btn:hover:not(:disabled) {
    background: #4A90E2;
    border-color: #4A90E2;
    color: #fff;
  }
  .option-btn.selected {
    background: #4A90E2;
    border-color: #4A90E2;
    color: #fff;
  }
  .option-btn.correct {
    background: #7ED321;
    border-color: #7ED321;
    color: #fff;
  }
  .option-btn.incorrect {
    background: #D0021B;
    border-color: #D0021B;
    color: #fff;
  }
  .option-label {
    display: inline-flex;
    width: 30px;
    height: 30px;
    background: #50E3C2;
    color: #fff;
    font-weight: bold;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
  }
  .explanation-panel {
    margin-top: 1rem;
    background: #e8f5e9;
    border-left: 4px solid #7ED321;
    border-radius: 8px;
    padding: 1rem;
  }
  .exp-title {
    color: #7ED321;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  .hint {
    background: #fff9c4;
    border-left: 4px solid #F5A623;
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .hint-icon {
    font-size: 1.2rem;
  }
  </style>
  