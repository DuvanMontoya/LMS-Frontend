<!-- src/lib/components/curso/CourseReviews.svelte -->
<script>
    export let reseñas = [];
    export let calificacionPromedio = 0;
  </script>
  
  <section class="course-reviews">
    <h2 class="section-title">Reseñas de estudiantes</h2>
    <div class="reviews-summary">
      <div class="average-rating">
        <span class="big-rating">{calificacionPromedio?.toFixed(1) || 'N/A'}</span>
        <div class="stars">
          {#each Array(5) as _, i}
            <i class="fas fa-star" class:filled={i < Math.round(calificacionPromedio || 0)}></i>
          {/each}
        </div>
        <span class="total-reviews">{reseñas?.length || 0} reseñas</span>
      </div>
    </div>
    {#if reseñas && reseñas.length > 0}
      <div class="reviews-list">
        {#each reseñas as reseña}
          <div class="review-item">
            <div class="review-header">
              <span class="reviewer-name">{reseña.usuario}</span>
              <span class="review-date">{new Date(reseña.fecha).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">
              {#each Array(5) as _, i}
                <i class="fas fa-star" class:filled={i < reseña.calificacion}></i>
              {/each}
            </div>
            <p class="review-comment">{reseña.comentario}</p>
          </div>
        {/each}
      </div>
    {:else}
      <p class="no-reviews">Este curso aún no tiene reseñas.</p>
    {/if}
  </section>
  
  <style>
    .course-reviews {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .course-reviews:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
  
    .section-title {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      border-bottom: 3px solid #3498db;
      display: inline-block;
      padding-bottom: 0.3rem;
    }
  
    .reviews-summary {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
    }
  
    .average-rating {
      text-align: center;
    }
  
    .big-rating {
      font-size: 3rem;
      font-weight: 700;
      color: #f1c40f;
      line-height: 1;
    }
  
    .stars {
      display: flex;
      justify-content: center;
      margin: 0.5rem 0;
    }
  
    .stars i {
      font-size: 1.5rem;
      color: #e0e0e0;
      margin: 0 0.1rem;
    }
  
    .stars i.filled {
      color: #f1c40f;
    }
  
    .total-reviews {
      font-size: 1rem;
      color: #7f8c8d;
    }
  
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .review-item {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: background-color 0.3s ease;
    }
  
    .review-item:hover {
      background-color: #e9ecef;
    }
  
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
  
    .reviewer-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 1rem;
    }
  
    .review-date {
      font-size: 0.9rem;
      color: #7f8c8d;
    }
  
    .review-rating {
      margin-bottom: 0.5rem;
    }
  
    .review-rating i {
      font-size: 1rem;
      color: #e0e0e0;
    }
  
    .review-rating i.filled {
      color: #f1c40f;
    }
  
    .review-comment {
      font-style: italic;
      color: #34495e;
      font-size: 1rem;
      text-align: justify;
    }
  
    .no-reviews {
      text-align: center;
      color: #7f8c8d;
      font-size: 1rem;
      padding: 1rem 0;
    }
  
    @media (max-width: 768px) {
      .reviews-summary {
        flex-direction: column;
        gap: 1rem;
      }
  
      .big-rating {
        font-size: 2.5rem;
      }
  
      .stars i {
        font-size: 1.2rem;
      }
    }
  </style>  