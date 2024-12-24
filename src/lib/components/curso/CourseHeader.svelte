<!-- src/lib/components/curso/CourseHeader.svelte -->
<script>
    import { fade } from "svelte/transition"; // Importar fade
    export let curso;
  </script>
  
  <header class="course-header" in:fade>
    <h1 class="course-title">{curso.titulo}</h1>
    <p class="course-subtitle">{@html curso.descripcion_corta}</p>
    <div class="course-meta">
      <span class="meta-item"><i class="fas fa-user"></i> {curso.profesor?.usuario || 'Instructor no especificado'}</span>
      <span class="meta-item"><i class="fas fa-calendar-alt"></i> Última actualización: {new Date(curso.fecha_actualizacion).toLocaleDateString()}</span>
      <span class="meta-item"><i class="fas fa-globe-americas"></i> {curso.idiomas_disponibles?.join(', ') || 'No especificado'}</span>
      <span class="meta-item"><i class="fas fa-signal"></i> Nivel: {curso.dificultad}</span>
    </div>
  </header>
  
  
  <style>
    .course-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 1rem;
      border-bottom: 2px solid #ecf0f1;
      background: linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  
    .course-title {
      font-family: 'Merriweather', serif;
      font-size: 3rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
    }
  
    .course-subtitle {
      font-size: 1.3rem;
      color: #ecf0f1;
      margin-bottom: 1rem;
    }
  
    .course-meta {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
  
    .meta-item {
      font-size: 1rem;
      display: flex;
      align-items: center;
      color: #ecf0f1;
    }
  
    .meta-item i {
      margin-right: 0.5rem;
      color: #f1c40f;
    }
  
    @media (max-width: 768px) {
      .course-title {
        font-size: 2.5rem;
      }
  
      .course-subtitle {
        font-size: 1.1rem;
      }
  
      .meta-item {
        font-size: 0.9rem;
      }
    }
  </style>  