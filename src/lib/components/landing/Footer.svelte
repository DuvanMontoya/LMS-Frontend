<!-- /lib/components/Footer.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import Logo from './Logo.svelte';
  
    let isInView = false;
    let activeForm = 'newsletter';
    let email = '';
    let message = '';
    let name = '';
    let phone = '';
    let whatsappNumber = '+573XXXXXXXXX';
    let isContactOpen = false;
  
    // Estadísticas de la comunidad
    const communityStats = {
      students: '2000+',
      countries: '5+',
      satisfaction: '98%',
      support: '24/7'
    };
  
    const links = {
      programa: [
        { text: 'Plan de Estudios', href: '#programa' },
        { text: 'Matemáticas', href: '#matematicas' },
        { text: 'Física', href: '#fisica' },
        { text: 'Simulacros', href: '#simulacros' }
      ],
      recursos: [
        { text: 'Blog', href: '/blog' },
        { text: 'Guías Gratuitas', href: '/recursos' },
        { text: 'Calculadora UNAL', href: '/calculadora' },
        { text: 'Videos Tutorial', href: '/videos' }
      ],
      comunidad: [
        { text: 'Historias de Éxito', href: '#testimonios' },
        { text: 'Grupo de Estudio', href: '/comunidad' },
        { text: 'Foro de Preguntas', href: '/foro' },
        { text: 'Eventos', href: '/eventos' }
      ],
      soporte: [
        { text: 'Preguntas Frecuentes', href: '#preguntas' },
        { text: 'Contacto', href: '#contacto' },
        { text: 'Términos y Condiciones', href: '/terminos' },
        { text: 'Política de Privacidad', href: '/privacidad' }
      ]
    };
  
    const socialLinks = [
      {
        name: 'Facebook',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
        url: '#'
      },
      {
        name: 'Instagram',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
        url: '#'
      },
      {
        name: 'YouTube',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
        url: '#'
      },
      {
        name: 'WhatsApp',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
        url: `https://wa.me/${whatsappNumber}`
      }
    ];
  
    const certifications = [
      {
        name: 'ISO 9001',
        icon: '🏆',
        description: 'Certificación de Calidad'
      },
      {
        name: 'SSL Secure',
        icon: '🔒',
        description: 'Sitio 100% Seguro'
      },
      {
        name: 'Top Rated',
        icon: '⭐',
        description: 'Calificación 4.9/5'
      }
    ];
  
    onMount(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isInView = true;
          }
        },
        { threshold: 0.1 }
      );
  
      const footer = document.querySelector('.footer-section');
      if (footer) {
        observer.observe(footer);
      }
  
      return () => {
        if (footer) {
          observer.unobserve(footer);
        }
      };
    });
  
    function handleNewsletterSubmit() {
      // Implementar lógica de suscripción
      console.log('Newsletter subscription:', email);
    }
  
    function handleContactSubmit() {
      // Implementar lógica de contacto
      console.log('Contact form:', { name, email, message });
    }
  
    function handleWhatsAppClick() {
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    }
  
    const currentYear = new Date().getFullYear();
  </script>
  
  <style>
    .footer-section {
      position: relative;
      padding: 6rem 2rem 2rem;
      background: var(--gradient);
      color: white;
      overflow: hidden;
    }
  
    .footer-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('/patterns/circuit-board.svg');
      opacity: 0.1;
      z-index: 1;
    }
  
    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
  
    .footer-top {
      display: grid;
      grid-template-columns: 2fr repeat(4, 1fr);
      gap: 4rem;
      margin-bottom: 4rem;
      padding-bottom: 4rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
  
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    .brand-info p {
      font-size: 1.1rem;
      line-height: 1.8;
      opacity: 0.9;
      margin: 1.5rem 0;
    }
  
    .community-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  
    .stat-item {
      text-align: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
  
    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
  
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  
    .footer-links-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .column-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  
    .footer-links {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .footer-link {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .footer-link:hover {
      opacity: 1;
      transform: translateX(5px);
    }
  
    .footer-middle {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4rem;
      margin-bottom: 4rem;
    }
  
    .contact-form {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2rem;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }
  
    .form-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
  
    .form-tab {
      padding: 0.8rem 1.5rem;
      background: none;
      border: none;
      color: white;
      opacity: 0.8;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
  
    .form-tab::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  
    .form-tab.active {
      opacity: 1;
    }
  
    .form-tab.active::after {
      opacity: 1;
    }
  
    .input-group {
      margin-bottom: 1.5rem;
    }
  
    .input-label {
      display: block;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }
  
    .input-field {
      width: 100%;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.5rem;
      color: white;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
  
    .input-field:focus {
      outline: none;
      border-color: white;
      background: rgba(255, 255, 255, 0.15);
    }
  
    .submit-button {
      width: 100%;
      padding: 1rem;
      background: white;
      color: var(--primary);
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
  
    .submit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
  
    .certifications {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-top: 2rem;
    }
  
    .certification-item {
      text-align: center;
    }
  
    .certification-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
  
    .social-links {
      display: flex;
      gap: 1.5rem;
      margin-top: 2rem;
    }
  
    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
    }
  
    .social-link:hover {
      background: white;
      color: var(--primary);
      transform: translateY(-3px);
    }
  
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
  
    .copyright {
      opacity: 0.8;
      font-size: 0.9rem;
    }
  
    .legal-links {
      display: flex;
      gap: 2rem;
    }
  
    .legal-link {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }
  
    .legal-link:hover {
      opacity: 1;
    }
  
    .whatsapp-button {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 100;
  }

  .whatsapp-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .whatsapp-tooltip {
    position: absolute;
    right: 70px;
    background: white;
    color: var(--text);
    padding: 0.8rem 1.5rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .whatsapp-button:hover .whatsapp-tooltip {
    opacity: 1;
    transform: translateX(0);
  }

  @media (max-width: 1200px) {
    .footer-top {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .footer-middle {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .community-stats {
      grid-template-columns: 1fr;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }

    .legal-links {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>

<section class="footer-section">
  <div class="footer-pattern"></div>
  
  <div class="footer-container">
    {#if isInView}
      <div class="footer-top" in:fade={{ duration: 1000 }}>
        <div class="footer-brand">
          <Logo variant="white" size={60} />
          <div class="brand-info">
            <p>
              Preparación especializada para el examen de admisión de la Universidad Nacional de Colombia.
              Expertos en matemáticas y física desde 2015.
            </p>
          </div>
          <div class="community-stats">
            {#each Object.entries(communityStats) as [key, value]}
              <div class="stat-item">
                <div class="stat-value">{value}</div>
                <div class="stat-label">{key}</div>
              </div>
            {/each}
          </div>
        </div>

        {#each Object.entries(links) as [category, categoryLinks]}
          <div class="footer-links-column">
            <h3 class="column-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <ul class="footer-links">
              {#each categoryLinks as link}
                <li>
                  <a href={link.href} class="footer-link">
                    {link.text}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <div class="footer-middle" in:fade={{ duration: 1000, delay: 200 }}>
        <div class="contact-form">
          <div class="form-tabs">
            <button
              class="form-tab"
              class:active={activeForm === 'newsletter'}
              on:click={() => activeForm = 'newsletter'}
            >
              Newsletter
            </button>
            <button
              class="form-tab"
              class:active={activeForm === 'contact'}
              on:click={() => activeForm = 'contact'}
            >
              Contacto
            </button>
          </div>

          {#if activeForm === 'newsletter'}
            <form on:submit|preventDefault={handleNewsletterSubmit}>
              <div class="input-group">
                <label class="input-label" for="email">
                  Suscríbete para recibir tips y recursos gratuitos
                </label>
                <input
                  type="email"
                  id="email"
                  class="input-field"
                  placeholder="Tu correo electrónico"
                  required
                  bind:value={email}
                />
              </div>
              <button type="submit" class="submit-button">
                Suscribirme
              </button>
            </form>
          {:else}
            <form on:submit|preventDefault={handleContactSubmit}>
              <div class="input-group">
                <label class="input-label" for="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  class="input-field"
                  required
                  bind:value={name}
                />
              </div>
              <div class="input-group">
                <label class="input-label" for="contact-email">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  class="input-field"
                  required
                  bind:value={email}
                />
              </div>
              <div class="input-group">
                <label class="input-label" for="message">Mensaje</label>
                <textarea
                  id="message"
                  class="input-field"
                  rows="4"
                  required
                  bind:value={message}
                ></textarea>
              </div>
              <button type="submit" class="submit-button">
                Enviar Mensaje
              </button>
            </form>
          {/if}
        </div>

        <div class="certifications-section">
          <h3 class="column-title">Certificaciones y Reconocimientos</h3>
          <div class="certifications">
            {#each certifications as cert}
              <div class="certification-item">
                <div class="certification-icon">{cert.icon}</div>
                <h4>{cert.name}</h4>
                <p>{cert.description}</p>
              </div>
            {/each}
          </div>
          <div class="social-links">
            {#each socialLinks as link}
              <a
                href={link.url}
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
              >
                {@html link.icon}
              </a>
            {/each}
          </div>
        </div>
      </div>

      <div class="footer-bottom" in:fade={{ duration: 1000, delay: 400 }}>
        <div class="copyright">
          © {currentYear} PreUNAL. Todos los derechos reservados.
        </div>
        <div class="legal-links">
          <a href="/terminos" class="legal-link">Términos y Condiciones</a>
          <a href="/privacidad" class="legal-link">Política de Privacidad</a>
          <a href="/cookies" class="legal-link">Política de Cookies</a>
        </div>
      </div>
    {/if}
  </div>

  <!-- Botón flotante de WhatsApp -->
  <button class="whatsapp-button" on:click={handleWhatsAppClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <div class="whatsapp-tooltip">
      ¿Necesitas ayuda? ¡Escríbenos!
    </div>
  </button>
</section>