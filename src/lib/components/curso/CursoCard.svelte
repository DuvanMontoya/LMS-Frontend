<script>
  export let curso;
  import { onMount } from 'svelte';

  let ratingStars = [];

  onMount(() => {
    updateStars();
  });

  function updateStars() {
    const rating = parseFloat(curso.calificacion_promedio) || 0;
    ratingStars = Array(5).fill().map((_, index) => {
      const starPercentage = Math.min(Math.max((rating - index) * 100, 0), 100);
      return { percentage: starPercentage };
    });
  }

  $: imageUrl = curso.imagen_principal_url || 'https://via.placeholder.com/300x180?text=No+Image';
  $: professorName = curso.profesor?.usuario || 'Profesor no asignado';
  $: category = curso.categoria?.nombre || 'Sin categoría';
  $: startDate = new Date(curso.fecha_inicio).toLocaleDateString("es-ES", { month: 'short', day: 'numeric' });
  $: endDate = new Date(curso.fecha_fin).toLocaleDateString("es-ES", { month: 'short', day: 'numeric' });
</script>

<div class="curso-card">
  <div class="card-content">
    <div class="image-container">
      <img src={imageUrl} alt={curso.titulo} class="curso-image" />
      <div class="image-overlay">
        <span class="curso-access {curso.es_premium ? 'premium' : 'free'}">
          {curso.es_premium ? "💎 Premium" : "🔓 Gratuito"}
        </span>
      </div>
    </div>
    <div class="info-container">
      <h3 class="curso-title">{curso.titulo}</h3>
      <div class="curso-meta">
        <span class="curso-date">
          {startDate} - {endDate}
        </span>
      </div>
      <div class="curso-details">
        <p title="Categoría"><i class="fas fa-book"></i>{category}</p>
        <p title="Profesor"><i class="fas fa-user"></i>{professorName}</p>
        <p title="Dificultad"><i class="fas fa-signal"></i>{curso.dificultad}</p>
        <p title="Modalidad"><i class="fas fa-calendar-alt"></i>{curso.modalidad}</p>
      </div>
    </div>
  </div>
  <div class="card-footer">
    <div class="curso-rating" title="Calificación promedio">
      <span class="rating-average">{curso.calificacion_promedio || "N/A"}</span>
      <div class="rating-stars">
        {#each ratingStars as star}
          <div class="star-container">
            <i class="fas fa-star star-outline"></i>
            <i class="fas fa-star star-fill" style="width: {star.percentage}%"></i>
          </div>
        {/each}
      </div>
    </div>
    <a href="/cursos/{curso.id}" class="enter-button">
      Explorar
      <span class="button-icon"><i class="fas fa-arrow-right"></i></span>
    </a>
  </div>
</div>


  <style>
    .curso-card {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 290px;
      height: 100%;
      overflow: hidden;
      transition: all 0.3s ease;
      /* position: relative; */
    }
  
    .curso-card:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-5px);
    }
  
    .card-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      /* overflow: hidden; */
    }
  
    .image-container {
      position: relative;
      height: 180px;
      overflow: hidden;
    }
  
    .curso-image, .placeholder-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.3s ease;
    }
  
    .placeholder-image {
      background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 3rem;
      color: #9ca3af;
    }
  
    .curso-card:hover .curso-image,
    .curso-card:hover .placeholder-image {
      transform: scale(1.05);
    }
  
    .image-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 2;
    }
  
    .curso-access {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
  
    .curso-access.premium {
      background: linear-gradient(45deg, #fbbf24, #d97706);
      color: #ffffff;
    }
  
    .curso-access.free {
      background: linear-gradient(45deg, #34d399, #059669);
      color: #ffffff;
    }
  
    .info-container {
      padding: 15px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  
    .curso-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 10px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  
    .curso-meta {
      margin-bottom: 10px;
    }
  
    .curso-date {
      font-size: 0.8rem;
      color: #6b7280;
    }
  
    .curso-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 0.85rem;
    }
  
    .curso-details p {
      display: flex;
      align-items: center;
      margin: 0;
      color: #4b5563;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  
    .curso-details i {
      margin-right: 6px;
      font-size: 0.9rem;
      color: #3b82f6;
      width: 16px;
      text-align: center;
    }
  
    .card-footer {
      background-color: #f3f4f6;
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e5e7eb;
    }
  
    .curso-rating {
      display: flex;
      align-items: center;
    }
  
    .rating-average {
      font-size: 1rem;
      font-weight: 700;
      color: #1f2937;
      margin-right: 6px;
    }
  
    .rating-stars {
      display: flex;
    }
  
    .star-container {
      position: relative;
      width: 16px;
      height: 16px;
      margin-right: 2px;
    }
  
    .star-outline, .star-fill {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  
    .star-outline {
      color: #d1d5db;
    }
  
    .star-fill {
      color: #fbbf24;
      overflow: hidden;
    }
  
    .enter-button {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      color: #ffffff;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }
  
    .enter-button:hover {
      background: linear-gradient(45deg, #2563eb, #1d4ed8);
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }
  
    .button-icon {
      margin-left: 6px;
      transition: transform 0.3s ease;
    }
  
    .enter-button:hover .button-icon {
      transform: translateX(3px);
    }
  
    @media (max-width: 640px) {
      .curso-card {
        max-width: 100%;
      }
    }
  </style>