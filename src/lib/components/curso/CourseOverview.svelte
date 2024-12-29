<!-- src/lib/components/curso/CourseOverview.svelte -->
<script>
    export let curso;
    import { slide } from 'svelte/transition';
  </script>
  
  <section class="course-overview" in:slide>
    <div class="overview-stats">
      <div class="stat-item">
        <i class="fas fa-star"></i>
        <span>{curso.calificacion_promedio?.toFixed(1) || 'N/A'}</span>
        <p>Calificación</p>
      </div>
      <div class="stat-item">
        <i class="fas fa-users"></i>
        <span>{curso.inscritos?.length || 0}</span>
        <p>Estudiantes</p>
      </div>
      <div class="stat-item">
        <i class="fas fa-clock"></i>
        <span>{curso.duracion_total} días</span>
        <p>Duración</p>
      </div>
      <div class="stat-item">
        <i class="fas fa-certificate"></i>
        <span>{curso.certificado_disponible ? 'Sí' : 'No'}</span>
        <p>Certificado</p>
      </div>
    </div>
  </section>
  
  <style>
    .course-overview {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .course-overview:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
  
    .overview-stats {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 2rem;
    }
  
    .stat-item {
      text-align: center;
      flex: 1;
      min-width: 120px;
      padding: 1rem;
      border-radius: 8px;
      background-color: #f1f2f6;
      transition: background-color 0.3s ease;
    }
  
    .stat-item:hover {
      background-color: #dfe4ea;
    }
  
    .stat-item i {
      font-size: 2rem;
      color: #3498db;
      margin-bottom: 0.5rem;
    }
  
    .stat-item span {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      display: block;
      margin-bottom: 0.3rem;
    }
  
    .stat-item p {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin: 0;
    }
  
    @media (max-width: 768px) {
      .overview-stats {
        flex-direction: column;
        align-items: center;
      }
  
      .stat-item {
        width: 80%;
        min-width: 0;
      }
    }
  </style>  