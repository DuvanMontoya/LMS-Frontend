<!-- /lib/components/Navbar.svelte -->
<script>
    import { onMount } from 'svelte';
    import Logo from './Logo.svelte';
    import { fade, slide } from 'svelte/transition';
    
    let isScrolled = false;
    let isMenuOpen = false;
    let prevScrollPos = 0;
    let isVisible = true;
    let activeSection = 'inicio';
  
    const navItems = [
      { id: 'inicio', label: 'Inicio', href: '#inicio' },
      { 
        id: 'programa', 
        label: 'Programa', 
        href: '#programa',
        submenu: [
          { label: 'Matemáticas', href: '#matematicas' },
          { label: 'Física', href: '#fisica' },
          { label: 'Plan de Estudio', href: '#plan' }
        ]
      },
      { id: 'metodologia', label: 'Metodología', href: '#metodologia' },
      { id: 'simulacros', label: 'Simulacros', href: '#simulacros' },
      { id: 'testimonios', label: 'Testimonios', href: '#testimonios' }
    ];
  
    onMount(() => {
      const handleScroll = () => {
        const currentScrollPos = window.scrollY;
        
        // Control de visibilidad basado en dirección de scroll
        isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 50;
        prevScrollPos = currentScrollPos;
        
        // Efecto de fondo al scroll
        isScrolled = currentScrollPos > 50;
        
        // Detectar sección activa
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          if (currentScrollPos >= sectionTop && currentScrollPos < sectionTop + sectionHeight) {
            activeSection = section.id;
          }
        });
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    });
  
    // Control de submenús
    let hoveredItem = null;
    
    function handleMouseEnter(item) {
      hoveredItem = item;
    }
    
    function handleMouseLeave() {
      hoveredItem = null;
    }
  </script>
  
  <style>
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      transition: all 0.3s ease;
      height: 80px;
      display: flex;
      align-items: center;
    }
  
    .nav-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .scrolled {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      height: 70px;
    }
  
    .hidden {
      transform: translateY(-100%);
    }
  
    .nav-items {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
  
    .nav-item {
      position: relative;
      height: 40px;
      display: flex;
      align-items: center;
    }
  
    .nav-link {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
  
    .nav-link:hover,
    .nav-link.active {
      color: var(--primary);
      background: rgba(45, 49, 146, 0.1);
    }
  
    .submenu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 1rem;
      padding: 1rem;
      min-width: 200px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
  
    .nav-item:hover .submenu {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  
    .submenu-item {
      padding: 0.5rem 1rem;
      color: var(--text);
      text-decoration: none;
      display: block;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
  
    .submenu-item:hover {
      background: rgba(45, 49, 146, 0.1);
      color: var(--primary);
    }
  
    .cta-button {
      background: var(--gradient);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
  
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(45, 49, 146, 0.2);
    }
  
    .menu-button {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      z-index: 100;
    }
  
    .mobile-menu {
      display: none;
    }
  
    @media (max-width: 1024px) {
      .nav-items {
        display: none;
      }
  
      .menu-button {
        display: block;
      }
  
      .mobile-menu {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        padding: 5rem 2rem 2rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }
  
      .mobile-menu.open {
        transform: translateX(0);
      }
  
      .mobile-nav-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
  
      .mobile-nav-link {
        font-size: 1.2rem;
        padding: 1rem;
        border-radius: 0.5rem;
        color: var(--text);
        text-decoration: none;
        transition: all 0.3s ease;
      }
  
      .mobile-nav-link:hover,
      .mobile-nav-link.active {
        background: rgba(45, 49, 146, 0.1);
        color: var(--primary);
      }
  
      .mobile-submenu {
        margin-left: 1rem;
        margin-top: 0.5rem;
        border-left: 2px solid rgba(45, 49, 146, 0.2);
        padding-left: 1rem;
      }
    }
  </style>
  
    <nav class:isScrolled class:scrolled={isScrolled} class:hidden={!isVisible}>

    <div class="nav-container">
      <a href="#inicio" class="logo-link">
        <Logo 
          size={isScrolled ? 40 : 50} 
          variant={isScrolled ? 'gradient' : 'default'} 
        />
      </a>
  
      <div class="nav-items">
        {#each navItems as item}
          <div 
            class="nav-item"
            role="menuitem"
            tabindex="0"
            on:mouseenter={() => handleMouseEnter(item)}
            on:mouseleave={handleMouseLeave}
          >
            <a 
              href={item.href}
              class="nav-link"
              class:active={activeSection === item.id}
            >
              {item.label}
            </a>
            
            {#if item.submenu && hoveredItem === item}
              <div class="submenu" transition:fade>
                {#each item.submenu as subitem}
                  <a href={subitem.href} class="submenu-item">
                    {subitem.label}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
        
        <a href="#pricing" class="cta-button">
          ¡Inscríbete Ya!
        </a>
      </div>
  
      <button 
        class="menu-button"
        on:click={() => isMenuOpen = !isMenuOpen}
        aria-label="Menú"
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          {#if isMenuOpen}
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          {:else}
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          {/if}
        </svg>
      </button>
    </div>
  
    {#if isMenuOpen}
      <div 
        class="mobile-menu"
        class:open={isMenuOpen}
        transition:slide
      >
        <div class="mobile-nav-items">
          {#each navItems as item}
            <div class="mobile-nav-item">
              <a 
                href={item.href}
                class="mobile-nav-link"
                class:active={activeSection === item.id}
                on:click={() => isMenuOpen = false}
              >
                {item.label}
              </a>
              
              {#if item.submenu}
                <div class="mobile-submenu">
                  {#each item.submenu as subitem}
                    <a 
                      href={subitem.href}
                      class="mobile-nav-link"
                      on:click={() => isMenuOpen = false}
                    >
                      {subitem.label}
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
          
          <a 
            href="#pricing" 
            class="cta-button"
            on:click={() => isMenuOpen = false}
          >
            ¡Inscríbete Ya!
          </a>
        </div>
      </div>
    {/if}
  </nav>