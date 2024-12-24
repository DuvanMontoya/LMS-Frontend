<!-- src/lib/components/curso/InstructorInfo.svelte -->
<script>
    export let profesor;
  </script>
  
  <section class="instructor-info">
    <h2 class="section-title">Acerca del instructor</h2>
    {#if profesor}
      <div class="instructor-profile">
        <img src={profesor.foto_url || '/default-avatar.jpg'} alt={profesor.usuario} class="instructor-avatar" loading="lazy">
        <div class="instructor-details">
          <h3>{profesor.usuario}</h3>
          <p class="instructor-title">{profesor.titulo}</p>
          <p class="instructor-bio">{profesor.bio}</p>
          <div class="instructor-stats">
            <span><i class="fas fa-star"></i> {profesor.promedio_calificacion || 'N/A'} Calificación promedio</span>
            <span><i class="fas fa-comments"></i> {profesor.num_reseñas} Reseñas</span>
            <span><i class="fas fa-users"></i> {profesor.num_estudiantes} Estudiantes</span>
            <span><i class="fas fa-book"></i> {profesor.cursos_creados?.length || 0} Cursos</span>
          </div>
        </div>
      </div>
    {:else}
      <p>Información del instructor no disponible.</p>
    {/if}
  </section>
  
  <style>
    .instructor-info {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .instructor-info:hover {
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
  
    .instructor-profile {
      display: flex;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: wrap;
    }
  
    .instructor-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #3498db;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  
    .instructor-details {
      flex: 1;
    }
  
    .instructor-details h3 {
      font-family: 'Merriweather', serif;
      font-size: 1.6rem;
      color: #2c3e50;
      margin-bottom: 0.3rem;
    }
  
    .instructor-title {
      font-size: 1rem;
      color: #7f8c8d;
      margin-bottom: 1rem;
    }
  
    .instructor-bio {
      font-size: 1rem;
      color: #34495e;
      line-height: 1.6;
      margin-bottom: 1rem;
      text-align: justify;
    }
  
    .instructor-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
  
    .instructor-stats span {
      font-size: 0.95rem;
      color: #7f8c8d;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  
    .instructor-stats i {
      color: #3498db;
    }
  
    @media (max-width: 768px) {
      .instructor-profile {
        flex-direction: column;
        align-items: center;
      }
  
      .instructor-details {
        text-align: center;
      }
    }
  </style>  