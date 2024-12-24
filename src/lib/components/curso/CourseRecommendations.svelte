<!-- src/lib/components/curso/CourseRecommendations.svelte -->
<script>
    export let cursosRecomendados = [];
  </script>
  
  <section class="course-recommendations">
    <h2 class="section-title">Cursos relacionados</h2>
    <div class="recommendations-grid">
      {#each cursosRecomendados as cursoRecomendado}
        <div class="recommendation-card">
          <img 
            src={cursoRecomendado.imagen_principal_url || "/default-course-image.jpg"} 
            alt={cursoRecomendado.titulo} 
            class="card-image" 
            loading="lazy"
          />
          <div class="card-content">
            <h3>{cursoRecomendado.titulo}</h3>
            <p>{@html cursoRecomendado.descripcion_corta}</p>
            <div class="card-footer">
              <span class="card-rating">
                <i class="fas fa-star"></i> {cursoRecomendado.calificacion_promedio?.toFixed(1) || 'N/A'}
              </span>
              <a href="/cursos/{cursoRecomendado.id}" class="btn-secondary">Ver curso</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
  
  <style>
    .course-recommendations {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .course-recommendations:hover {
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
  
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  
    .recommendation-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .recommendation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
  
    .card-image {
      width: 100%;
      height: 160px;
      object-fit: cover;
      display: block;
    }
  
    .card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .card-content h3 {
      font-size: 1.2rem;
      color: #2c3e50;
      margin: 0;
    }
  
    .card-content p {
      font-size: 0.95rem;
      color: #7f8c8d;
      flex: 1;
    }
  
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .card-rating {
      font-size: 1rem;
      font-weight: 600;
      color: #f1c40f;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  
    .card-rating i {
      color: #f1c40f;
    }
  
    .btn-secondary {
      background-color: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-size: 0.95rem;
    }
  
    .btn-secondary:hover {
      background-color: #2980b9;
    }
  
    @media (max-width: 768px) {
      .recommendations-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
  
      .card-content h3 {
        font-size: 1.1rem;
      }
  
      .card-content p {
        font-size: 0.9rem;
      }
    }
  </style>  