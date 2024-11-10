<script>
  import { onMount, afterUpdate } from "svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { sessionStore } from "$lib/stores/sessionStore";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";

  let isSidebarOpen = false;
  let isMobile = false;
  let activeItem = "dashboard";
  let isDarkMode = false;
  let searchQuery = "";

  const sidebarWidthOpen = 260;
  const sidebarWidthClosed = 70;

  const menuItems = [
    { id: "inicio", href: "/inicio", icon: "home", text: "Inicio" },
    { id: "articulos", href: "/articulos", icon: "file-text", text: "Artículos" },
    { id: "cursos", href: "/cursos", icon: "book", text: "Cursos" },
    { id: "evaluaciones", href: "/evaluaciones", icon: "clipboard", text: "Evaluaciones" },
    { id: "calendario", href: "/calendario", icon: "calendar-alt", text: "Calendario" },
  ];

  $: sidebarWidth = tweened(
    isMobile ? 0 : isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed,
    {
      duration: 300,
      easing: cubicOut,
    }
  );

  $: filteredItems = menuItems.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      toggleSidebar();
    }
  }

  function setActiveItem(item) {
    activeItem = item;
    if (isMobile) {
      isSidebarOpen = false;
    }
  }

  function handleResize() {
    isMobile = window.innerWidth <= 768;
    if (isMobile) {
      isSidebarOpen = false;
    }
    sidebarWidth.set(isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed);
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  });

  afterUpdate(() => {
    document.body.style.overflow = isMobile && isSidebarOpen ? "hidden" : "";
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode");
  }

  async function handleLogout() {
    await sessionStore.logout();
    goto("/login");
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="app-container" class:sidebar-open={isSidebarOpen} class:dark-mode={isDarkMode}>
  <aside
    class="sidebar"
    class:open={isSidebarOpen}
    style:width="{$sidebarWidth}px"
    transition:slide={{ duration: 300, axis: 'x' }}
  >
    <div class="sidebar-header">
      <button
        class="sidebar-toggle"
        on:click={toggleSidebar}
        aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
      >
        <i class="fas fa-bars"></i>
      </button>
      {#if isSidebarOpen}
        <div class="logo" in:fade={{ duration: 200 }}>
          <span class="logo-text">Laila</span>
        </div>
      {/if}
    </div>

    {#if isSidebarOpen}
      <div class="search-container" in:slide={{ duration: 200 }}>
        <input
          type="text"
          placeholder="Buscar..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
    {/if}

    <nav class="sidebar-nav">
      <ul class="sidebar-list">
        {#each filteredItems as item (item.id)}
          <li class="sidebar-item">
            <a
              href={item.href}
              class="sidebar-link"
              class:active={activeItem === item.id}
              on:click={() => setActiveItem(item.id)}
              aria-current={activeItem === item.id ? "page" : undefined}
              aria-label={item.text}
            >
              <i class="fas fa-{item.icon}"></i>
              {#if isSidebarOpen}
                <span class="sidebar-text">{item.text}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-link theme-toggle" on:click={toggleDarkMode}>
        <i class="fas fa-{isDarkMode ? 'sun' : 'moon'}"></i>
        {#if isSidebarOpen}
          <span class="sidebar-text">
            {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          </span>
        {/if}
      </button>
      <button class="sidebar-link logout-button" on:click={handleLogout}>
        <i class="fas fa-power-off"></i>
        {#if isSidebarOpen}
          <span class="sidebar-text">Cerrar Sesión</span>
        {/if}
      </button>
    </div>
  </aside>

  <main class="main-content" style:margin-left="{$sidebarWidth}px">
    <slot />
  </main>

  {#if isMobile && isSidebarOpen}
    <div
      class="overlay"
      on:click={toggleSidebar}
      transition:fade={{ duration: 200 }}
    ></div>
  {/if}
</div>

<style>
  :root {
    --sidebar-width-open: 260px;
    --sidebar-width-closed: 70px;
    --sidebar-bg: #ffffff;
    --sidebar-text: #333333;
    --sidebar-hover: #f0f0f0;
    --sidebar-active: #e6e6e6;
    --sidebar-icon: #666666;
    --main-bg: #f5f5f5;
    --main-text: #333333;
    --transition-speed: 0.3s;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --accent-color: #3498db;
  }

  .dark-mode {
    --sidebar-bg: #1a202c;
    --sidebar-text: #e2e8f0;
    --sidebar-hover: #2d3748;
    --sidebar-active: #4a5568;
    --sidebar-icon: #a0aec0;
    --main-bg: #2d3748;
    --main-text: #e2e8f0;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    --accent-color: #3498db;
  }

  .app-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background-color: var(--main-bg);
    color: var(--main-text);
    transition: background-color var(--transition-speed);
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    transition: all var(--transition-speed) ease;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: var(--box-shadow);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    height: 60px;
  }

  .sidebar-toggle {
    background: none;
    border: none;
    color: var(--sidebar-icon);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: background-color var(--transition-speed);
  }

  .sidebar-toggle:hover {
    background-color: var(--sidebar-hover);
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .logo-text {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--accent-color);
  }

  .search-container {
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--sidebar-hover);
    border-radius: 4px;
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
  }

  .sidebar-nav {
    flex-grow: 1;
    overflow-y: auto;
  }

  .sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar-item {
    margin: 0.5rem 0;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: background-color var(--transition-speed);
    border-radius: 4px;
  }

  .sidebar-link:hover,
  .sidebar-link:focus {
    background-color: var(--sidebar-hover);
  }

  .sidebar-link.active {
    background-color: var(--sidebar-active);
    font-weight: bold;
    color: var(--accent-color);
  }

  .sidebar-link i {
    width: 24px;
    text-align: center;
    font-size: 1.2rem;
    margin-right: 1rem;
  }

  .sidebar:not(.open) .sidebar-link {
    justify-content: center;
    padding: 0.75rem 0;
  }

  .sidebar:not(.open) .sidebar-link i {
    margin-right: 0;
  }

  .sidebar-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar:not(.open) .sidebar-text {
    display: none;
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--sidebar-hover);
  }

  .theme-toggle,
  .logout-button {
    width: 100%;
    justify-content: flex-start;
    margin-bottom: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-speed);
  }

  .theme-toggle:hover,
  .logout-button:hover {
    background-color: var(--sidebar-hover);
  }

  .logout-button {
    color: #e74c3c;
  }

  .main-content {
    flex-grow: 1;
    transition: margin-left var(--transition-speed);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .main-content {
      margin-left: 0 !important;
    }
  }

  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: var(--sidebar-bg);
  }

  .sidebar::-webkit-scrollbar-thumb {
    background-color: var(--sidebar-icon);
    border-radius: 3px;
  }

  .sidebar::-webkit-scrollbar-thumb:hover {
    background-color: var(--sidebar-text);
  }

  .sidebar-link::after {
    content: "";
    position: absolute;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 100px;
    height: 100px;
    margin-top: -50px;
    margin-left: -50px;
    opacity: 0;
    transition: all 0.8s;
  }

  .sidebar-link:active::after {
    width: 0;
    height: 0;
    opacity: 1;
    transition: 0s;
  }

  .sidebar:not(.open) .sidebar-link::before {
    content: attr(aria-label);
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    padding: 0.5rem;
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    border-radius: 4px;
    font-size: 0.8rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: var(--box-shadow);
    white-space: nowrap;
    z-index: 1001;
  }

  .sidebar:not(.open) .sidebar-link:hover::before {
    opacity: 1;
    transform: translateY(-50%) translateX(10px);
  }

  .sidebar,
  .sidebar-link,
  .theme-toggle,
  .logout-button {
    transition: all var(--transition-speed) ease;
  }

  .sidebar-link:focus,
  .theme-toggle:focus,
  .logout-button:focus,
  .sidebar-toggle:focus,
  .search-input:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sidebar-link,
  .theme-toggle,
  .logout-button {
    position: relative;
    overflow: hidden;
  }

  .sidebar-link::before,
  .theme-toggle::before,
  .logout-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s;
  }

  .sidebar-link:hover::before,
  .theme-toggle:hover::before,
  .logout-button:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 100% !important;
    }

    .sidebar-link,
    .theme-toggle,
    .logout-button {
      padding: 1rem;
    }

    .sidebar-link i,
    .theme-toggle i,
    .logout-button i {
      margin-right: 1rem;
    }

    .sidebar-text {
      display: inline !important;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .sidebar.open .sidebar-link,
  .sidebar.open .theme-toggle,
  .sidebar.open .logout-button {
    animation: fadeIn 0.3s ease-in-out;
  }

  .sidebar-link:active,
  .theme-toggle:active,
  .logout-button:active,
  .sidebar-toggle:active {
    transform: scale(0.95);
  }

  .sidebar-link.active::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 4px;
    background-color: var(--accent-color);
  }

  .sidebar-text,
  .logo-text {
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  }

  /* Nuevas mejoras estéticas */
  .sidebar {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.8);
  }

  .dark-mode .sidebar {
    background-color: rgba(26, 32, 44, 0.8);
  }

  .sidebar-link,
  .theme-toggle,
  .logout-button {
    border-radius: 8px;
    margin: 0.25rem 0.5rem;
  }

  .sidebar-link i,
  .theme-toggle i,
  .logout-button i {
    transition: transform 0.3s ease;
  }

  .sidebar-link:hover i,
  .theme-toggle:hover i,
  .logout-button:hover i {
    transform: scale(1.2);
  }

  .search-input {
    border: none;
    border-bottom: 2px solid var(--sidebar-hover);
    border-radius: 0;
    padding: 0.5rem 0;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    border-color: var(--accent-color);
  }

  .sidebar-footer {
    background-color: rgba(0, 0, 0, 0.05);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .dark-mode .sidebar-footer {
    background-color: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>