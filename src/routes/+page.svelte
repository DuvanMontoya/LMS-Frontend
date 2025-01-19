<!-- /routes/landing/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    
    // Importación de componentes
    import Navbar from '$lib/components/landing/Navbar.svelte';
    import Hero from '$lib/components/landing/Hero.svelte';
    import Program from '$lib/components/landing/Program.svelte';
    import Methodology from '$lib/components/landing/Methodology.svelte';
    import Simulations from '$lib/components/landing/Simulations2.svelte';
    import Testimonials from '$lib/components/landing/Testimonials.svelte';
    import FAQ from '$lib/components/landing/FAQ.svelte';
    import Pricing from '$lib/components/landing/Pricing.svelte';
    import Footer from '$lib/components/landing/Footer.svelte';
  
    let isLoading = true;
    let currentSection = '';
    let scrollProgress = 0;
    let sections = [];
  
    // Background patterns generados con SVG
    const patterns = {
      grid: `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h40v40H0z" fill="none"/>
          <path d="M0 0h1v40H0z" fill="currentColor" opacity="0.1"/>
          <path d="M0 0h40v1H0z" fill="currentColor" opacity="0.1"/>
        </svg>
      `,
      dots: `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.1"/>
        </svg>
      `,
      circuit: `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10h80v80H10z" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
          <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.1"/>
          <circle cx="90" cy="90" r="2" fill="currentColor" opacity="0.1"/>
          <path d="M10 10c40 0 40 80 80 80" stroke="currentColor" stroke-width="0.5" opacity="0.1" fill="none"/>
        </svg>
      `
    };
  
    onMount(async () => {
      // Inicialización de secciones
      sections = Array.from(document.querySelectorAll('section[id]'));
      
      // Observer para detectar sección activa
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              currentSection = entry.target.id;
              updateBackground(entry.target.id);
            }
          });
        },
        { threshold: 0.3 }
      );
  
      sections.forEach(section => observer.observe(section));
  
      // Listener para el progreso del scroll
      window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = (window.scrollY / totalHeight) * 100;
      });
  
      // Animación de carga
      setTimeout(() => {
        isLoading = false;
      }, 1000);
  
      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updateProgress);
      };
    });
  
    function updateBackground(sectionId) {
      const colors = {
        inicio: { primary: '#2D3192', secondary: '#00B0EC' },
        programa: { primary: '#4B50B2', secondary: '#33C1EF' },
        metodologia: { primary: '#2D3192', secondary: '#FFD700' },
        simulacros: { primary: '#00B0EC', secondary: '#4B50B2' },
        testimonios: { primary: '#FFD700', secondary: '#00B0EC' },
        preguntas: { primary: '#2D3192', secondary: '#4B50B2' },
        precios: { primary: '#00B0EC', secondary: '#FFD700' }
      };
  
      document.documentElement.style.setProperty(
        '--current-gradient',
        `linear-gradient(135deg, ${colors[sectionId]?.primary || '#2D3192'}, ${colors[sectionId]?.secondary || '#00B0EC'})`
      );
    }
  </script>
  
  <style>
    /* Variables globales */
    :global(:root) {
      --primary: #2D3192;
      --secondary: #00B0EC;
      --accent: #FFD700;
      --text: #333333;
      --background: #FFFFFF;
      --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
      --current-gradient: var(--gradient);
    }
  
    /* Estilos base */
    :global(html) {
      scroll-behavior: smooth;
    }
  
    :global(body) {
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }
  
    /* Contenedor principal */
    .landing-container {
      position: relative;
      min-height: 100vh;
      background: var(--background);
    }
  
    /* Loader */
    .loader-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--current-gradient);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    }
  
    .loader {
      position: relative;
      width: 100px;
      height: 100px;
    }
  
    .loader-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 4px solid white;
      border-radius: 50%;
      animation: loader-spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }
  
    .loader-circle:nth-child(2) {
      animation-delay: -0.5s;
      opacity: 0.7;
    }
  
    /* Progress bar */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: var(--current-gradient);
      z-index: 1000;
      transition: width 0.3s ease;
    }
  
    /* Navegación lateral */
    .side-nav {
      position: fixed;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 100;
    }
  
    .nav-indicator {
      position: relative;
      width: 12px;
      height: 12px;
      background: transparent;
      border: 2px solid var(--primary);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
    }
  
    .nav-indicator::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  
    .nav-indicator:hover::before,
    .nav-indicator.active::before {
      opacity: 1;
    }
  
    .nav-tooltip {
      position: absolute;
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      background: white;
      border-radius: 1rem;
      font-size: 0.9rem;
      color: var(--primary);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      white-space: nowrap;
    }
  
    .nav-indicator:hover .nav-tooltip {
      opacity: 1;
    }
  
    /* Background patterns */
    .background-pattern {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.5;
      mask-image: linear-gradient(to bottom, transparent, black, transparent);
    }
  
    /* Decorative elements */
    .decorative-shapes {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
  
    .shape {
      position: absolute;
      opacity: 0.1;
      animation: float 20s infinite;
    }
  
    /* Secciones */
    :global(section) {
      position: relative;
      padding: 6rem 2rem;
      overflow: hidden;
    }
  
    :global(section::before) {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--current-gradient);
      opacity: 0.05;
      z-index: -1;
    }
  
    /* Animaciones */
    @keyframes loader-spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }
  
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(30px, -30px) rotate(180deg); }
    }
  
    /* Media queries */
    @media (max-width: 1024px) {
      .side-nav {
        display: none;
      }
    }
  
    @media (max-width: 768px) {
      :global(section) {
        padding: 4rem 1rem;
      }
    }
  </style>
  
  <svelte:head>
    <!-- Metadatos -->
    <title>PreUNAL - Preparación Especializada para el Examen de Admisión UNAL</title>
    <meta name="description" content="Preparación especializada en matemáticas y física para el examen de admisión de la Universidad Nacional de Colombia. Metodología probada, profesores expertos y recursos exclusivos." />
    
    <!-- Fuentes -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Meta tags para SEO y redes sociales -->
    <meta property="og:title" content="PreUNAL - Tu Camino al Éxito" />
    <meta property="og:description" content="Preparación especializada para el examen de admisión UNAL" />
    <meta property="og:type" content="website" />
  </svelte:head>
  
  <!-- Loader -->
  {#if isLoading}
    <div class="loader-screen" transition:fade>
      <div class="loader">
        <div class="loader-circle"></div>
        <div class="loader-circle"></div>
      </div>
    </div>
  {/if}
  
  <!-- Progress Bar -->
  <div 
    class="progress-bar"
    style="width: {scrollProgress}%"
  ></div>
  
  <!-- Main Container -->
  <div class="landing-container">
    <!-- Background Patterns -->
    <div class="background-pattern">
      {@html patterns.grid}
      {@html patterns.dots}
      {@html patterns.circuit}
    </div>
  
    <!-- Decorative Shapes -->
    <div class="decorative-shapes">
      {#each Array(10) as _, i}
        <div
          class="shape"
          style="
            left: {Math.random() * 100}%;
            top: {Math.random() * 100}%;
            width: {Math.random() * 50 + 20}px;
            height: {Math.random() * 50 + 20}px;
            background: var(--primary);
            border-radius: {Math.random() > 0.5 ? '50%' : '0'};
            animation-delay: -{Math.random() * 20}s;
          "
        ></div>
      {/each}
    </div>
  
    <!-- Side Navigation -->
    <nav class="side-nav">
      {#each sections as section}
        <button
          class="nav-indicator"
          class:active={currentSection === section.id}
          on:click={() => section.scrollIntoView({ behavior: 'smooth' })}
        >
          <span class="nav-tooltip">
            {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
          </span>
        </button>
      {/each}
    </nav>
  
    <!-- Components -->
    <Navbar />
  
    <main>
      <Hero />
      <Program />
      <Methodology />
      <Simulations />
      <Testimonials />
      <FAQ />
      <Pricing />
    </main>
  
    <Footer />
  </div>