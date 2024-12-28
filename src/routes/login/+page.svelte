<!-- src/routes/login/+page.svelte -->
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
    if (!isFormValid) {
      Object.keys(formErrors).forEach(field => {
        validateInput(field, field === 'username' ? username : password);
      });
      return;
    }

    isLoading = true;
    error = "";
    progress = 0;

    try {
      const tokenData = await fetchToken(username, password);
      if (!tokenData.access) throw new Error("La autenticación falló");

      progress = 50;

      const userData = await fetchUserInfo(tokenData.access);
      if (!userData) throw new Error("No se pudo obtener la información del usuario");

      progress = 75;

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
      error = e.message === "La autenticación falló" ? "Usuario o contraseña incorrectos" : "Error al iniciar sesión. Por favor, inténtelo de nuevo.";
      console.error("Error de inicio de sesión:", e);
    } finally {
      isLoading = false;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Iniciar Sesión | Portal Corporativo</title>
  <meta name="description" content="Accede a tu cuenta en nuestro portal corporativo seguro y eficiente." />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
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
            <span id="username-error" class="error-message" transition:fade>
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
              class="input password-input"
              class:error={formErrors.password}
              class:show-password={showPassword}
              aria-invalid={formErrors.password ? "true" : "false"}
              aria-describedby="password-error"
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
            <span id="password-error" class="error-message" transition:fade>
              {formErrors.password}
            </span>
          {/if}
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="remember-me" bind:checked={rememberMe}>
          <label for="remember-me">Recordarme</label>
          <span class="tooltip">Mantén tu sesión activa en este dispositivo</span>
        </div>

        {#if error}
          <div class="alert destructive" role="alert" transition:fade>
            {error}
          </div>
        {/if}

        <button type="submit" class="button primary login-button" disabled={isLoading}>
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
    --primary-color: #2c3e50;
    --primary-hover: #34495e;
    --background-color: #f7f7f7;
    --text-color: #333333;
    --input-border: #ececec;
    --input-focus: #2c3e50;
    --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --error-color: #d32f2f;
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
    min-height: 100vh;
    padding: 2rem;
  }

  .login-container {
    background: #ffffff;
    padding: 2.5rem;
    border-radius: 0.5rem;
    box-shadow: var(--box-shadow);
    width: 100%;
    max-width: 400px;
  }

  .title {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 2rem;
    text-align: center;
    font-weight: 600;
  }

  .input-group {
    position: relative;
    margin-bottom: 1.5rem;
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
    border: 1px solid var(--input-border);
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .input:focus,
  .input:not(:placeholder-shown) {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.2);
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
    margin-top: 0.25rem;
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
    position: relative;
  }

  .checkbox-group input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .checkbox-group .tooltip {
    visibility: hidden;
    position: absolute;
    bottom: 100%;
    left: 0;
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .checkbox-group:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    outline: none;
    border: none;
    font-size: 1rem;
  }

  .primary {
    background-color: var(--primary-color);
    color: white;
  }

  .primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
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
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .destructive {
    background-color: #fef2f2;
    color: var(--error-color);
    border: 1px solid #fecaca;
  }

  .progress-container {
    width: 100%;
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1rem;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }

  .loader {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --primary-color: #3498db;
      --primary-hover: #2980b9;
      --background-color: #1a202c;
      --text-color: #e2e8f0;
      --input-border: #2d3748;
      --input-focus: #3498db;
      --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
    }

    .login-container {
      background: #2d3748;
    }

    .input {
      background-color: #1a202c;
      color: var(--text-color);
    }

    .destructive {
    background-color: #742a2a;
    color: #fecaca;
    border-color: #991b1b;
  }

  .progress-container {
    background-color: #4a5568;
  }

  .checkbox-group .tooltip {
    background-color: #4a5568;
    color: #e2e8f0;
  }
}

@media screen and (max-width: 480px) {
  .login-container {
    padding: 2rem;
    border-radius: 0.375rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .button {
    padding: 0.875rem 1.5rem;
  }
}

/* Animations and additional effects */
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

/* Hover glow effect */
.input:hover,
.button:hover {
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(44, 62, 80, 0.2);
}

/* Custom checkbox style */
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

/* Accessibility focus improvements */
.input:focus,
.button:focus,
.checkbox-group input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.4);
}

/* Placeholder style */
.input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

/* Input ripple effect */
.input:focus {
  animation: inputPulse 1s infinite;
}

@keyframes inputPulse {
  0% { box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(44, 62, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(44, 62, 80, 0); }
}

/* Error shake animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.input.error {
  animation: shake 0.8s ease-in-out;
}

/* Smooth transitions */
.input,
.button,
.checkbox-group input[type="checkbox"],
.toggle-password {
  transition: all 0.3s ease;
}

</style>