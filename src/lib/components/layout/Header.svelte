<script>
  import { sessionStore } from "$lib/stores/sessionStore";
  import { onMount, createEventDispatcher } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import Logo from "./Logo.svelte";

  const dispatch = createEventDispatcher();
  let isMenuOpen = false;
  let isScrolled = false;
  let prevScrollPos = 0;
  let headerHeight;
  let isHeaderVisible = true;

  export let isSidebarOpen = false;

  function handleLogout() {
    dispatch("logout");
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }

  function handleScroll() {
    const currentScrollPos = window.pageYOffset;
    isScrolled = currentScrollPos > 10;
    isHeaderVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
    prevScrollPos = currentScrollPos;
  }

  onMount(() => {
    headerHeight = document.querySelector(".header").offsetHeight;
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight}px`,
    );
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header
  class="header"
  class:scrolled={isScrolled}
  class:hidden={!isHeaderVisible}
  class:sidebar-open={isSidebarOpen}
>
  <div class="header__container">
    <div class="logo-container" in:fade={{ duration: 300, delay: 200 }}>
      <Logo />
    </div>

    <nav class="header__nav">
      <ul class="header__nav-list">
        {#if $sessionStore.isAuthenticated}
          <!-- <li
            class="header__nav-item"
            in:fly={{ y: -20, duration: 300, delay: 100 }}
          >
            <a href="/inicio" class="header__nav-btn header__nav-btn-dash"
              >Dashboard</a
            >
          </li> -->
          <li
            class="header__nav-item"
            in:fly={{ y: -20, duration: 300, delay: 200 }}
          >
            <button
              class="header__nav-btn header__nav-btn--danger"
              on:click={handleLogout}>Salir</button
            >
          </li>
        {:else}
          <li
            class="header__nav-item"
            in:fly={{ y: -20, duration: 300, delay: 100 }}
          >
            <a href="/login" class="header__nav-btn">Entrar</a>
          </li>
          <li
            class="header__nav-item"
            in:fly={{ y: -20, duration: 300, delay: 200 }}
          >
            <a href="/register" class="header__nav-btn header__nav-btn--outline"
              >Registrarse</a
            >
          </li>
        {/if}
      </ul>
    </nav>

    <button
      class="menu-toggle"
      on:click={toggleMenu}
      aria-label="Toggle menu"
      class:active={isMenuOpen}
    >
      <span class="menu-toggle__icon"></span>
    </button>
  </div>
</header>

{#if isMenuOpen}
  <div class="mobile-menu open" transition:slide={{ duration: 300 }}>
    <nav class="mobile-nav">
      <ul class="mobile-nav-list">
        {#if $sessionStore.isAuthenticated}
          <li
            class="mobile-nav-item"
            in:fly={{ x: 20, duration: 300, delay: 100 }}
          >
            <a href="/inicio" class="mobile-nav-btn" on:click={toggleMenu}
              >Dashboard</a
            >
          </li>
          <li
            class="mobile-nav-item"
            in:fly={{ x: 20, duration: 300, delay: 200 }}
          >
            <button
              class="mobile-nav-btn mobile-nav-btn--danger"
              on:click={() => {
                handleLogout();
                toggleMenu();
              }}>Salir</button
            >
          </li>
        {:else}
          <li
            class="mobile-nav-item"
            in:fly={{ x: 20, duration: 300, delay: 100 }}
          >
            <a href="/login" class="mobile-nav-btn" on:click={toggleMenu}
              >Entrar</a
            >
          </li>
          <li
            class="mobile-nav-item"
            in:fly={{ x: 20, duration: 300, delay: 200 }}
          >
            <a
              href="/register"
              class="mobile-nav-btn mobile-nav-btn--outline"
              on:click={toggleMenu}>Registrarse</a
            >
          </li>
        {/if}
      </ul>
    </nav>
  </div>
{/if}

<style>
  :root {
    --primary-color: #3a86ff;
    --primary-hover: #2667ff;
    --danger-color: #ff006e;
    --danger-hover: #d90062;
    --text-color: #2b2d42;
    --bg-color: #ffffff;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --header-height: 80px;
    --header-height-scrolled: 60px;
    --sidebar-width: 260px;
    --sidebar-width-closed: 70px;
  }

  .header {
    font-family: "Inter", sans-serif;
    background-color: var(--bg-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    margin-bottom: 1rem;
  }

  .header.scrolled {
    height: var(--header-height-scrolled);
    box-shadow: 0 4px 12px var(--shadow-color);
  }

  .header.hidden {
    transform: translateY(-100%);
  }

  .header__container {
    max-width: 100%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    position: relative;
  }

  .logo-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    display: flex;
    align-items: center;
  }

  .header.sidebar-open .logo-container {
    left: calc(50% + var(--sidebar-width) / 2);
  }

  .header__nav {
    margin-left: auto;
  }

  .header__nav-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .header__nav-item {
    margin-left: 1rem;
  }

  .header__nav-btn {
    font-size: 1rem;
    font-weight: 500;
    padding: 0.7rem 1.5rem;
    border-radius: 30px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* .header__nav-btn-dash {
    background-color: var(--bg-color);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  } */

  .header__nav-btn {
    background-color: var(--primary-color);
    color: var(--bg-color);
  }

  .header__nav-btn--outline {
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }

  .header__nav-btn--danger {
    background-color: #1976d2;
    color: var(--bg-color);
  }

  .header__nav-btn:hover,
  .header__nav-btn--outline:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow-color);
  }

  .header__nav-btn:hover {
    background-color: var(--primary-hover);
  }

  .header__nav-btn--outline:hover {
    background-color: var(--primary-color);
    color: var(--bg-color);
  }

  /* .header__nav-btn--danger:hover {
    background-color: var(--danger-hover);
  } */

  .menu-toggle {
    display: none;
  }

  .mobile-menu {
    display: none;
  }

  @media screen and (max-width: 768px) {
    .header__nav {
      display: none;
    }

    .menu-toggle {
      display: block;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 1001;
      width: 30px;
      height: 30px;
      position: relative;
    }

    .menu-toggle__icon,
    .menu-toggle__icon::before,
    .menu-toggle__icon::after {
      content: "";
      position: absolute;
      background-color: var(--text-color);
      height: 2px;
      width: 100%;
      left: 0;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .menu-toggle__icon {
      top: 50%;
      transform: translateY(-50%);
    }

    .menu-toggle__icon::before {
      top: -8px;
    }

    .menu-toggle__icon::after {
      bottom: -8px;
    }

    .menu-toggle.active .menu-toggle__icon {
      background-color: transparent;
    }

    .menu-toggle.active .menu-toggle__icon::before {
      top: 0;
      transform: rotate(45deg);
    }

    .menu-toggle.active .menu-toggle__icon::after {
      top: 0;
      transform: rotate(-45deg);
    }

    .mobile-menu {
      display: block;
      position: fixed;
      top: var(--header-height);
      right: 0;
      bottom: 0;
      width: 80%;
      max-width: 300px;
      background-color: var(--bg-color);
      z-index: 999;
      padding: 2rem;
      box-shadow: -2px 0 10px var(--shadow-color);
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
    }

    .mobile-menu.open {
      transform: translateX(0);
    }

    .mobile-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .mobile-nav-item {
      margin-bottom: 1.5rem;
    }

    .mobile-nav-btn {
      display: block;
      width: 100%;
      text-align: left;
      font-size: 1.2rem;
      padding: 1rem;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      text-decoration: none;
      color: var(--text-color);
    }

    .mobile-nav-btn--outline {
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
    }

    .mobile-nav-btn--danger {
      background-color: var(--danger-color);
      color: var(--bg-color);
    }

    .mobile-nav-btn:hover {
      background-color: var(--primary-color);
      color: var(--bg-color);
    }

    .menu-toggle {
      position: absolute;
      right: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header,
    .header__nav-btn,
    .menu-toggle__icon,
    .menu-toggle__icon::before,
    .menu-toggle__icon::after {
      transition: none;
    }
  }
</style>
