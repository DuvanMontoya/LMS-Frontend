<script>
  import { createEventDispatcher } from 'svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faArrowLeft, faBars, faTimes, faComments } from '@fortawesome/free-solid-svg-icons';
 
  export let curso = {};
  export let progresoCurso = 0;
  let planAbierto = true;

  const dispatch = createEventDispatcher();

  function goBack() {
    dispatch('goBack');
  }

  function togglePlan() {
    planAbierto = !planAbierto;
    dispatch('togglePlan', planAbierto);
  }

  function openDiscussions() {
    dispatch('openDiscussions');
  }
</script>

<nav class="curso-nav">
<div class="nav-container">
  <div class="nav-group">
    <button class="nav-btn btn-back" on:click={goBack} aria-label="Volver">
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
    <button
      class="nav-btn btn-plan"
      class:active={planAbierto}
      on:click={togglePlan}
    >
      <FontAwesomeIcon icon={planAbierto ? faTimes : faBars} />
      <span>{planAbierto ? "Cerrar plan" : "Plan de estudios"}</span>
    </button>
  </div>
  <h1 class="curso-titulo">Curso: {curso.titulo}</h1>
  <div class="nav-group">
    <button class="nav-btn btn-discussions" on:click={openDiscussions}>
      <FontAwesomeIcon icon={faComments} />
      <span>Discusiones</span>
    </button>
  </div>
</div>
<div class="progreso-container">
  <div class="progreso-barra" style="width: {progresoCurso}%"></div>
</div>
</nav>

<style>
.curso-nav {
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 60px;
}

.nav-group {
  display: flex;
  align-items: stretch;
}

.nav-btn {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border: none;
  background: none;
  color: #4a5568;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #6e8efb;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-btn:hover::after,
.nav-btn:focus::after,
.nav-btn.active::after {
  transform: scaleX(1);
}

.nav-btn:hover,
.nav-btn:focus {
  color: #2d3748;
  background-color: rgba(110, 142, 251, 0.1);
  outline: none;
}

.nav-btn:active {
  transform: translateY(1px);
}

.nav-btn span {
  margin-left: 8px;
}

.btn-back:hover {
  color: #e53e3e;
}

.btn-plan.active {
  color: #6e8efb;
}

.btn-discussions:hover {
  color: #6e8efb;
}

.curso-titulo {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  text-align: center;
  padding: 0 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progreso-container {
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.progreso-barra {
  height: 100%;
  background: linear-gradient(90deg, #6e8efb, #a777e3);
  transition: width 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px rgba(110, 142, 251, 0.5);
}

@media (max-width: 768px) {
  .nav-btn span {
    display: none;
  }

  .nav-btn {
    padding: 0 0.75rem;
  }

  .curso-titulo {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.5rem;
  }

  .curso-titulo {
    font-size: 0.875rem;
  }
}
</style>