<script>
  import { createEventDispatcher } from 'svelte';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faChevronLeft, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';

  export let indiceActual;
  export let totalLecciones;
  export let panelAbierto = false;
  export let completada = false;

  const dispatch = createEventDispatcher();

  function irLeccionAnterior() {
    dispatch('irLeccionAnterior');
  }

  function irLeccionSiguiente() {
    dispatch('irLeccionSiguiente');
  }

  function completarLeccion() {
    dispatch('completarLeccion');
  }
</script>

<nav class="leccion-nav-bar" class:panel-abierto={panelAbierto}>
<div class="nav-content">
  <button class="btn-nav btn-anterior" on:click={irLeccionAnterior} disabled={indiceActual === 0}>
    <FontAwesomeIcon icon={faChevronLeft} />
    <span>Anterior</span>
  </button>
  <button class="btn-completar" on:click={completarLeccion} disabled={completada}>
    <FontAwesomeIcon icon={faCheck} />
    <span>{completada ? 'Completada' : 'Terminar'}</span>
  </button>
  <button class="btn-nav btn-siguiente" on:click={irLeccionSiguiente} disabled={indiceActual === totalLecciones - 1}>
    <span>Siguiente</span>
    <FontAwesomeIcon icon={faChevronRight} />
  </button>
</div>
</nav>

<style>
.leccion-nav-bar {
  font-family: 'Poppins', sans-serif;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 998;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.leccion-nav-bar.panel-abierto {
  left: 380px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  width: 100%;
  padding: 0 1rem;
}

.btn-nav, .btn-completar {
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-nav {
  background-color: #f0f4f8;
  color: #4a5568;
}

.btn-nav:hover:not(:disabled) {
  background-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-anterior:hover:not(:disabled) {
  transform: translateX(-2px) translateY(-2px);
}

.btn-siguiente:hover:not(:disabled) {
  transform: translateX(2px) translateY(-2px);
}

.btn-completar {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  position: relative;
  overflow: hidden;
}

.btn-completar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.btn-completar:hover:not(:disabled)::before {
  left: 100%;
}

.btn-completar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
}

.btn-nav:disabled, .btn-completar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 768px) {
  .leccion-nav-bar.panel-abierto {
    left: 0;
  }

  .btn-nav, .btn-completar {
    padding: 0.6rem 1rem;
  }

  .btn-nav span {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 0 0.5rem;
  }

  .btn-nav, .btn-completar {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>