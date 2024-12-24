<!-- src/lib/components/curso/CourseDescription.svelte -->
<script>
    export let descripcion;
  </script>
  
  <section class="course-description">
    <h2 class="section-title">Descripción del curso</h2>
    <p>{@html descripcion}</p>
  </section>
  
  <style>
    .course-description {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .course-description:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
  
    .section-title {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 1rem;
      border-bottom: 3px solid #3498db;
      display: inline-block;
      padding-bottom: 0.3rem;
    }
  
    .course-description p {
      font-size: 1rem;
      color: #34495e;
      line-height: 1.6;
      text-align: justify;
    }
  
    @media (max-width: 768px) {
      .section-title {
        font-size: 1.5rem;
      }
  
      .course-description p {
        font-size: 0.95rem;
      }
    }
  </style>  