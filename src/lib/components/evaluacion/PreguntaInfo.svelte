<script>
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faStar, faClock, faTags, faCalculator } from '@fortawesome/free-solid-svg-icons';
  
    export let pregunta = {};
  </script>
  
  <div class="pregunta-info">
    <div class="info-item">
        <FontAwesomeIcon icon={faStar} style="color: gold; margin-right: 10px; font-size: 1.2rem;" />
        <span class="info-value">{pregunta.dificultad ?? 'N/A'}</span>
    </div>
    <div class="info-item">
        <FontAwesomeIcon icon={faCalculator} style="color: #3498db; margin-right: 10px; font-size: 1.2rem;" />
        <span class="info-value">{pregunta.puntos ?? 0}</span>
    </div>
    <div class="info-item">
        <FontAwesomeIcon icon={faClock} style="color: #e67e22; margin-right: 10px; font-size: 1.2rem;" />
        <span class="info-value">{pregunta.tiempo_estimado ?? 0} min</span>
    </div>
    <div class="info-item">
        <FontAwesomeIcon icon={faTags} style="color: #27ae60; margin-right: 10px; font-size: 1.2rem;" />
        <span class="info-value">{pregunta.categoria ?? 'N/A'}</span>
    </div>
  </div>
  
  <style>
    .pregunta-info {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        /* background: rgba(255, 255, 255, 0.8); */
        padding: 5px 10px;
        border-radius: 10px;
        /* box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); */
    }
  
    .info-item {
        display: flex;
        align-items: center;
        margin-right: 20px;
        font-size: 0.9rem;
        color: #555555;
    }
  </style>
  