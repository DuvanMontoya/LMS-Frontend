<!-- /lib/components/Methodology.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import SectionTransition from './SectionTransition.svelte';
    
    let isInView = false;
    let observers = [];
  
    const methods = [
      {
        id: 'diagnostic',
        icon: '🎯',
        title: 'Diagnóstico Inicial Personalizado',
        description: 'Evaluamos tu nivel actual en matemáticas y física para crear un plan de estudio adaptado a tus necesidades específicas.',
        features: [
          {
            title: 'Evaluación Completa',
            description: 'Test diagnóstico que evalúa conocimientos previos, habilidades de razonamiento y áreas de oportunidad.',
            icon: '📊'
          },
          {
            title: 'Plan Personalizado',
            description: 'Creación de una ruta de aprendizaje única basada en tus resultados y objetivos.',
            icon: '🎯'
          },
          {
            title: 'Objetivos Medibles',
            description: 'Establecimiento de metas específicas y puntos de control para tu progreso.',
            icon: '📈'
          },
          {
            title: 'Retroalimentación Detallada',
            description: 'Análisis profundo de tus fortalezas y áreas de mejora.',
            icon: '📋'
          }
        ],
        stats: [
          { value: '98%', label: 'Precisión en diagnóstico' },
          { value: '35%', label: 'Mejora promedio' }
        ]
      },
      {
        id: 'classes',
        icon: '👨‍🏫',
        title: 'Clases Estructuradas y Dinámicas',
        description: 'Sistema de 6 horas semanales diseñado para maximizar tu comprensión y retención de conceptos clave.',
        features: [
          {
            title: 'Clases Teórico-Prácticas',
            description: '4 horas semanales dedicadas a la explicación y aplicación de conceptos fundamentales.',
            icon: '📚'
          },
          {
            title: 'Sesión de Dudas',
            description: '2 horas semanales exclusivas para resolver preguntas específicas y reforzar conocimientos.',
            icon: '❓'
          },
          {
            title: 'Grupos Reducidos',
            description: 'Máximo 20 estudiantes por grupo para garantizar atención personalizada.',
            icon: '👥'
          },
          {
            title: 'Material Multimedia',
            description: 'Acceso a grabaciones, recursos interactivos y material complementario 24/7.',
            icon: '🎥'
          }
        ],
        stats: [
          { value: '92%', label: 'Satisfacción estudiantil' },
          { value: '100%', label: 'Cobertura temática' }
        ]
      },
      {
        id: 'practice',
        icon: '💡',
        title: 'Práctica Intensiva y Simulacros',
        description: 'Sistema integral de práctica que combina ejercicios progresivos con simulacros realistas del examen.',
        features: [
          {
            title: 'Banco de Ejercicios',
            description: 'Más de 2000 ejercicios clasificados por tema y nivel de dificultad.',
            icon: '📝'
          },
          {
            title: 'Simulacros Semanales',
            description: 'Exámenes que replican exactamente el formato y nivel del examen real.',
            icon: '✍️'
          },
          {
            title: 'Análisis de Errores',
            description: 'Sistema inteligente que identifica patrones en tus errores y sugiere áreas de mejora.',
            icon: '🔍'
          },
          {
            title: 'Retroalimentación Inmediata',
            description: 'Explicaciones detalladas y soluciones paso a paso para cada ejercicio.',
            icon: '📌'
          }
        ],
        stats: [
          { value: '2000+', label: 'Ejercicios disponibles' },
          { value: '45%', label: 'Mejora en simulacros' }
        ]
      },
      {
        id: 'monitoring',
        icon: '📊',
        title: 'Seguimiento Continuo y Ajustes',
        description: 'Sistema de monitoreo en tiempo real que permite ajustar la estrategia según tu progreso.',
        features: [
          {
            title: 'Dashboard Personal',
            description: 'Interfaz intuitiva que muestra tu progreso, estadísticas y áreas de mejora.',
            icon: '📱'
          },
          {
            title: 'Alertas Inteligentes',
            description: 'Sistema que identifica y notifica sobre temas que requieren refuerzo.',
            icon: '🔔'
          },
          {
            title: 'Reportes Semanales',
            description: 'Informes detallados de tu desempeño y recomendaciones personalizadas.',
            icon: '📊'
          },
          {
            title: 'Ajustes Estratégicos',
            description: 'Modificaciones al plan de estudio basadas en tu desempeño real.',
            icon: '⚙️'
          }
        ],
        stats: [
          { value: '24/7', label: 'Monitoreo disponible' },
          { value: '96%', label: 'Efectividad en ajustes' }
        ]
      }
    ];
  
    onMount(() => {
      // Observador para la sección principal
      const sectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isInView = true;
          }
        },
        { threshold: 0.1 }
      );
  
      const section = document.querySelector('.methodology-section');
      if (section) {
        sectionObserver.observe(section);
      }
      observers.push(sectionObserver);
  
      return () => {
        observers.forEach(observer => observer.disconnect());
      };
    });
</script>

<style>
  :root {
    /* Paleta de Colores */
    --color-primary: #1E3A8A; /* Azul Marino */
    --color-secondary: #10B981; /* Verde Esmeralda */
    --color-background: #F9FAFB; /* Blanco Humo */
    --color-text: #111827; /* Casi Negro */
    --color-accent: #F59E0B; /* Amarillo Ámbar */
    --color-border: #D1D5DB; /* Gris Claro */
    --gradient: linear-gradient(135deg, #1E3A8A 0%, #10B981 100%);
    
    /* Tipografía */
    --font-family: 'Inter', sans-serif;
    
    /* Transiciones */
    --transition-duration: 0.3s;
    --transition-ease: ease;
  }

  .methodology-section {
    position: relative;
    padding: 8rem 2rem;
    background: var(--color-background);
    color: var(--color-text);
    overflow: hidden;
  }

  .methodology-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/patterns/circuit-board.svg');
    opacity: 0.05; /* Ajustado para una mayor sutilidad */
    z-index: 1;
  }

  .methodology-container {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .methodology-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .methodology-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  .methodology-description {
    font-size: 1.25rem;
    opacity: 0.95;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;
    color: var(--color-text);
  }

  .methods-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Mantiene 2 columnas */
    gap: 4rem; /* Mantiene el espacio original */
  }

  .method-card {
    background: #FFFFFF; /* Fondo Blanco para las tarjetas */
    border-radius: 1.5rem;
    padding: 2rem;
    transition: all var(--transition-duration) var(--transition-ease);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra ligera */
    border: 1px solid var(--color-border);
  }

  .method-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
  }

  .method-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .method-icon {
    font-size: 2.5rem;
    color: var(--color-primary);
  }

  .method-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
  }

  .method-description {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.9;
    margin-bottom: 1.5rem;
    color: var(--color-text);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Mantiene 2 columnas */
    gap: 2rem; /* Mantiene el espacio original */
    margin-bottom: 2rem;
  }

  .feature-card {
    background: #FFFFFF; /* Fondo Blanco para las características */
    border-radius: 1rem;
    padding: 1.5rem;
    transition: transform var(--transition-duration) var(--transition-ease), background var(--transition-duration) var(--transition-ease);
    border: 1px solid var(--color-border);
  }

  .feature-card:hover {
    background: #1e3a8a;
    transform: translateY(-5px);
    color: #FFFFFF;
  }

  .feature-card:hover .feature-title,
  .feature-card:hover .feature-description {
    color: #FFFFFF;
  }

  .feature-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .feature-icon {
    font-size: 1.5rem;
    color: var(--color-accent);
  }

  .feature-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  .feature-description {
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--color-text);
    opacity: 0.8;
  }

  .stats-container {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text);
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--color-text);
    opacity: 0.8;
  }

  /* Efectos decorativos */
  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(30, 58, 138, 0.05); /* Azul Marino con baja opacidad */
    animation: float 20s infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(-20px, -20px) rotate(180deg);
    }
  }

  @media (max-width: 1024px) {
    .methods-grid {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .methodology-title {
      font-size: 2.5rem;
    }

    .method-card {
      padding: 1.5rem;
    }

    .method-header {
      flex-direction: column;
      text-align: center;
    }

    .stats-container {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
</style>

<section class="methodology-section" id="metodologia">
  <div class="methodology-pattern"></div>
  
  <!-- Elementos decorativos -->
  {#each Array(5) as _, i}
    <div
      class="decoration-circle"
      style="
        width: {Math.random() * 200 + 100}px;
        height: {Math.random() * 200 + 100}px;
        top: {Math.random() * 100}%;
        left: {Math.random() * 100}%;
        animation-delay: -{Math.random() * 10}s;
      "
    ></div>
  {/each}

  <SectionTransition position="top" type="wave" />
  
  <div class="methodology-container">
    {#if isInView}
      <div class="methodology-header" in:fade={{ duration: 1000 }}>
        <h2 class="methodology-title">Metodología Única y Probada</h2>
        <p class="methodology-description">
          Nuestro sistema de enseñanza está diseñado científicamente para maximizar tu aprendizaje
          y garantizar tu éxito en el examen de admisión.
        </p>
      </div>

      <div class="methods-grid">
        {#each methods as method, index}
          <div class="method-card" in:fade={{ duration: 1000, delay: 200 * index }}>
            <div class="method-header">
              <span class="method-icon">{method.icon}</span>
              <h3 class="method-title">{method.title}</h3>
            </div>
            <p class="method-description">{method.description}</p>
            
            <div class="features-grid">
              {#each method.features as feature}
                <div class="feature-card" in:fade={{ duration: 500 }}>
                  <div class="feature-header">
                    <span class="feature-icon">{feature.icon}</span>
                    <h4 class="feature-title">{feature.title}</h4>
                  </div>
                  <p class="feature-description">
                    {feature.description}
                  </p>
                </div>
              {/each}
            </div>

            <div class="stats-container">
              {#each method.stats as stat}
                <div class="stat-item">
                  <div class="stat-value">{stat.value}</div>
                  <div class="stat-label">{stat.label}</div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <SectionTransition position="bottom" type="wave" />
</section>
