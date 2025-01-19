<!-- /routes/landing/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    
    // Animación para contador de estudiantes
    let studentCount = 0;
    const targetCount = 1500;
    
    onMount(() => {
      const interval = setInterval(() => {
        if (studentCount < targetCount) {
          studentCount += 10;
        } else {
          clearInterval(interval);
        }
      }, 20);
    });
  
    // Testimonios
    const testimonials = [
      {
        name: "Carlos Rodríguez",
        program: "Ingeniería Mecánica",
        message: "Gracias a PreUNAL logré un puntaje de 800 en el examen. Las clases son excepcionales."
      },
      {
        name: "Ana Martínez",
        program: "Física",
        message: "La metodología y el material exclusivo me ayudaron a comprender conceptos complejos."
      },
      {
        name: "Diego López",
        program: "Matemáticas",
        message: "Los simulacros en la plataforma son muy similares al examen real. ¡Excelente preparación!"
      }
    ];
  </script>
  
  <style>
    /* Variables globales */
    :root {
      --primary: #2D3192;
      --secondary: #00B0EC;
      --accent: #FFD700;
      --text: #333333;
      --background: #FFFFFF;
      --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
    }
  
    /* Estilos generales */
    :global(body) {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--text);
      line-height: 1.6;
    }
  
    /* Hero Section */
    .hero {
      min-height: 100vh;
      background: var(--gradient);
      display: flex;
      align-items: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
  
    .hero::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: url('/patterns/circuit-board.svg');
      opacity: 0.1;
      animation: float 20s linear infinite;
    }
  
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      color: white;
      position: relative;
      z-index: 1;
    }
  
    .hero h1 {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      line-height: 1.2;
      animation: fadeInUp 1s ease-out;
    }
  
    .hero p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      max-width: 600px;
      animation: fadeInUp 1s ease-out 0.3s backwards;
    }
  
    /* Sección de características */
    .features {
      padding: 5rem 2rem;
      background: var(--background);
    }
  
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .feature-card {
      padding: 2rem;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
  
    .feature-card:hover {
      transform: translateY(-10px);
    }
  
    /* Sección de estadísticas */
    .stats {
      background: var(--gradient);
      padding: 5rem 2rem;
      color: white;
      text-align: center;
    }
  
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .stat-item h3 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
  
    /* Sección de testimonios */
    .testimonials {
      padding: 5rem 2rem;
      background: var(--background);
    }
  
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .testimonial-card {
      padding: 2rem;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  
    /* Sección de precios */
    .pricing {
      padding: 5rem 2rem;
      background: #f8f9fa;
    }
  
    .price-card {
      padding: 3rem 2rem;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
      margin: 0 auto;
    }
  
    .price-card.featured {
      transform: scale(1.05);
      border: 2px solid var(--accent);
    }
  
    /* Botones y CTA */
    .cta-button {
      display: inline-block;
      padding: 1rem 2rem;
      background: var(--accent);
      color: var(--primary);
      text-decoration: none;
      border-radius: 2rem;
      font-weight: bold;
      transition: transform 0.3s ease;
    }
  
    .cta-button:hover {
      transform: scale(1.05);
    }
  
    /* Animaciones */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    @keyframes float {
      from { transform: translateY(0); }
      to { transform: translateY(-100%); }
    }
  
    /* Media Queries */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 3rem;
      }
  
      .hero p {
        font-size: 1.25rem;
      }
  
      .features-grid,
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Domina el Examen de Admisión UNAL</h1>
        <p>Preparación especializada en Matemáticas y Física con métodos probados y material exclusivo</p>
        <a href="#pricing" class="cta-button">¡Comienza tu preparación ahora!</a>
      </div>
    </section>
  
    <!-- Características principales -->
    <section class="features">
      <div class="features-grid">
        <div class="feature-card">
          <h3>Matemáticas Avanzadas</h3>
          <ul>
            <li>Álgebra y funciones</li>
            <li>Geometría y trigonometría</li>
            <li>Cálculo diferencial básico</li>
            <li>Probabilidad y estadística</li>
          </ul>
        </div>
        <div class="feature-card">
          <h3>Física Completa</h3>
          <ul>
            <li>Mecánica newtoniana</li>
            <li>Ondas y oscilaciones</li>
            <li>Electricidad y magnetismo</li>
            <li>Termodinámica básica</li>
          </ul>
        </div>
        <div class="feature-card">
          <h3>Metodología Única</h3>
          <ul>
            <li>6 horas semanales de clase</li>
            <li>Sesiones de resolución de dudas</li>
            <li>Material exclusivo</li>
            <li>Simulacros en plataforma propia</li>
          </ul>
        </div>
      </div>
    </section>
  
    <!-- Estadísticas -->
    <section class="stats">
      <div class="stats-container">
        <div class="stat-item">
          <h3>{studentCount}+</h3>
          <p>Estudiantes preparados</p>
        </div>
        <div class="stat-item">
          <h3>95%</h3>
          <p>Tasa de aprobación</p>
        </div>
        <div class="stat-item">
          <h3>100+</h3>
          <p>Horas de contenido</p>
        </div>
      </div>
    </section>
  
    <!-- Testimonios -->
    <section class="testimonials">
      <h2>Lo que dicen nuestros estudiantes</h2>
      <div class="testimonials-grid">
        {#each testimonials as testimonial}
          <div class="testimonial-card">
            <p>"{testimonial.message}"</p>
            <h4>{testimonial.name}</h4>
            <p>{testimonial.program}</p>
          </div>
        {/each}
      </div>
    </section>
  
    <!-- Precios -->
    <section class="pricing" id="pricing">
      <div class="price-card featured">
        <h2>Curso Completo</h2>
        <div class="price">$XXX.XXX COP</div>
        <ul>
          <li>Acceso completo por 4 meses</li>
          <li>6 horas semanales de clase en vivo</li>
          <li>Material exclusivo</li>
          <li>Simulacros ilimitados</li>
          <li>Clases grabadas</li>
          <li>Sesiones de resolución de dudas</li>
          <li>Retroalimentación en tiempo real</li>
        </ul>
        <a href="/registro" class="cta-button">¡Inscríbete ahora!</a>
      </div>
    </section>
  </div>