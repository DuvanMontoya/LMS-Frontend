<script>
  import { goto, invalidate } from "$app/navigation";
  import { sessionStore } from "$lib/stores/sessionStore";
  import { fetchUserInfo } from "$lib/api/usuarios/usuarios";
  import { fetchToken } from "$lib/api/api";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let username = "";
  let password = "";
  let error = "";
  let isLoading = false;
  let formErrors = {};
  let progress = 0;
  let showPassword = false;
  let rememberMe = false;

  $: isFormValid = username.length >= 3 && password.length >= 5;

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const validateInput = debounce((field, value) => {
    if (field === 'username' && value.length < 3) {
      formErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    } else if (field === 'password' && value.length < 5) {
      formErrors.password = "La contraseña debe tener al menos 5 caracteres";
    } else {
      delete formErrors[field];
    }
    formErrors = {...formErrors};
  }, 300);

  onMount(() => {
    document.querySelector('input[name="username"]').focus();
  });

  async function handleSubmit() {
    if (!isFormValid) return;

    isLoading = true;
    error = "";
    progress = 0;

    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 90) clearInterval(progressInterval);
    }, 100);

    try {
      const tokenData = await fetchToken(username, password);
      if (!tokenData.access) throw new Error("La autenticación falló");

      const userData = await fetchUserInfo(tokenData.access);
      if (!userData) throw new Error("No se pudo obtener la información del usuario");

      sessionStore.login({
        access: tokenData.access,
        refresh: tokenData.refresh,
        user: userData,
        isAuthenticated: true,
        rememberMe,
      });

      await invalidate("app:user");
      progress = 100;
      setTimeout(() => goto("/inicio"), 500);
    } catch (e) {
      error = e.message;
      console.error("Error de inicio de sesión:", e);
    } finally {
      isLoading = false;
      clearInterval(progressInterval);
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Iniciar Sesión | Portal Corporativo</title>
  <meta name="description" content="Accede a tu cuenta en nuestro portal corporativo seguro y eficiente." />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="login-container" in:fly={{ y: 50, duration: 800, easing: cubicOut }} out:fade>
    <div class="login-content">
      <h1 class="title">Bienvenido</h1>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <input
            type="text"
            id="username"
            name="username"
            bind:value={username}
            on:input={() => validateInput("username", username)}
            placeholder="Nombre de usuario"
            required
            class="input"
            class:error={formErrors.username}
            aria-invalid={formErrors.username ? "true" : "false"}
            aria-describedby="username-error"
          />
          <label for="username" class="input-label">Nombre de usuario</label>
          {#if formErrors.username}
            <span id="username-error" class="error-message">
              {formErrors.username}
            </span>
          {/if}
        </div>

        <div class="input-group">
          <div class="password-input-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              bind:value={password}
              on:input={() => validateInput("password", password)}
              placeholder="Contraseña"
              required
              class="input"
              class:error={formErrors.password}
              aria-invalid={formErrors.password ? "true" : "false"}
              aria-describedby="password-error"
              style={showPassword ? "-webkit-text-security: none; text-security: none;" : ""}
            />
            <label for="password" class="input-label">Contraseña</label>
            <button type="button" class="toggle-password" on:click={togglePasswordVisibility} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye">
                {#if showPassword}
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                {:else}
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                {/if}
              </svg>
            </button>
          </div>
          {#if formErrors.password}
            <span id="password-error" class="error-message">
              {formErrors.password}
            </span>
          {/if}
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="remember-me" bind:checked={rememberMe}>
          <label for="remember-me">Recordarme</label>
        </div>

        {#if error}
          <div class="alert destructive" role="alert">
            {error}
          </div>
        {/if}

        <button type="submit" class="button primary login-button" disabled={!isFormValid || isLoading}>
          {#if isLoading}
            <span class="loader"></span>
          {:else}
            Iniciar sesión
          {/if}
        </button>
      </form>
      {#if isLoading}
        <div class="progress-container">
          <div class="progress-bar" style="width: {progress}%"></div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  :root {
    --primary-color: #4f46e5;
    --primary-hover: #4338ca;
    --background-color: #f3f4f6;
    --text-color: #1f2937;
    --input-border: #d1d5db;
    --input-focus: #4f46e5;
    --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --error-color: #ef4444;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }  

  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }

  .login-container {
    background: rgba(255, 255, 255, 0.9);
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: var(--box-shadow);
    width: 100%;
    max-width: 400px;
    text-align: center;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .login-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .login-content {
    position: relative;
  }

  .title {
    font-size: 2.25rem;
    color: var(--primary-color);
    margin-bottom: 2rem;
    text-align: center;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }

  .input-group {
    position: relative;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .input-label {
    position: absolute;
    top: 0.75rem;
    left: 1rem;
    transition: all 0.3s ease;
    pointer-events: none;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--input-border);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .input:focus,
  .input:not(:placeholder-shown) {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  .input:focus + .input-label,
  .input:not(:placeholder-shown) + .input-label {
    transform: translateY(-1.5rem) scale(0.85);
    color: var(--primary-color);
    font-weight: 600;
  }

  .input.error {
    border-color: var(--error-color);
  }

  .error-message {
    display: block;
    color: var(--error-color);
    font-size: 0.75rem;
    margin-top: 0.5rem;
    text-align: left;
  }

  .password-input-wrapper {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: #6b7280;
    transition: color 0.3s ease;
  }

  .toggle-password:hover {
    color: var(--primary-color);
  }

  .toggle-password svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    user-select: none;
  }

  .checkbox-group input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    outline: none;
    border: none;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .primary {
    background-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.5), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
  }

  .primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
    box-shadow: 0 6px 10px -1px rgba(67, 56, 202, 0.4), 0 2px 4px -1px rgba(67, 56, 202, 0.06);
    transform: translateY(-2px);
  }

  .button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .login-button {
    width: 100%;
    margin-top: 1.5rem;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .destructive {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .progress-container {
    width: 100%;
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1.5rem;
  }

  .progress-bar {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }

    .loader {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --primary-color: #6366f1;
        --primary-hover: #818cf8;
        --background-color: #1f2937;
        --text-color: #f3f4f6;
        --input-border: #4b5563;
        --input-focus: #6366f1;
        --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
      }
     

      .login-container {
        background: rgba(31, 41, 55, 0.8);
      }

      .input {
        background-color: rgba(17, 24, 39, 0.8);
        color: var(--text-color);
      }

      .destructive {
        background-color: #7f1d1d;
        color: #fecaca;
        border-color: #b91c1c;
      }

      .progress-container {
        background-color: #4b5563;
      }
    }

    @media screen and (max-width: 480px) {
      .login-container {
        padding: 2rem;
        border-radius: 0.75rem;
      }

      .title {
        font-size: 2rem;
      }

      .input-group {
        margin-bottom: 1.25rem;
      }

      .button {
        padding: 0.875rem 1.5rem;
      }
    }

    /* Animaciones y efectos adicionales */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .login-container {
      animation: fadeIn 0.5s ease-out;
    }

    .button::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%);
      transform-origin: 50% 50%;
    }

    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      20% {
        transform: scale(25, 25);
        opacity: 0.5;
      }
      100% {
        opacity: 0;
        transform: scale(40, 40);
      }
    }

    .button:focus:not(:active)::after {
      animation: ripple 1s ease-out;
    }

    /* Efecto de brillo en hover */
    .input:hover,
    .button:hover {
      transition: all 0.3s ease;
      box-shadow: 0 0 15px rgba(79, 70, 229, 0.3);
    }

    /* Estilo para el checkbox personalizado */
    .checkbox-group input[type="checkbox"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--input-border);
      border-radius: 0.25rem;
      margin-right: 0.5rem;
      position: relative;
      cursor: pointer;
      vertical-align: middle;
    }

    .checkbox-group input[type="checkbox"]:checked {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-group input[type="checkbox"]:checked::after {
      content: '\2714';
      font-size: 1rem;
      color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .checkbox-group label {
      font-size: 0.875rem;
      color: var(--text-color);
      cursor: pointer;
    }

    /* Mejora en la accesibilidad para el foco */
    .input:focus,
    .button:focus,
    .checkbox-group input[type="checkbox"]:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.4);
    }

    /* Estilo para el placeholder */
    .input::placeholder {
      color: #9ca3af;
      opacity: 1;
    }

    /* Efecto de ondulación para los inputs */
    .input:focus {
      animation: inputPulse 1s infinite;
    }

    @keyframes inputPulse {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
  </style>