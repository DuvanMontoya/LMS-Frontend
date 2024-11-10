<!-- src/routes/register/+page.svelte -->
<script>
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { validator } from '@felte/validator-yup';
    import * as yup from 'yup';
    import ErrorMessage from '$lib/components/layout/ErrorMessage.svelte';
  
    let isLoading = false;
    let error = '';
  
    const schema = yup.object({
      email: yup.string().email('Invalid email address').required('Email is required'),
      username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
      password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    });
  
    const { form } = createForm({
      initialValues: {
        email: '',
        username: '',
        password: ''
      },
      onSubmit: async (values) => {
        isLoading = true;
        error = '';
  
        try {
          const response = await fetch('https://backend.laila.icu/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
  
          if (response.ok) {
            goto('/login');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
          }
        } catch (e) {
          error = e.message;
        } finally {
          isLoading = false;
        }
      },
      validate: validator({ schema })
    });
  </script>
  
  <main>
    <div class="register-container" in:fly={{ y: -50, duration: 500, easing: cubicOut }}>
      <div class="title-container">
        <h1 class="title" in:fade={{ duration: 500 }}>Register</h1>
        <div class="title-underline"></div>
      </div>
      {#if error}
        <p class="error" transition:fly={{ y: -20, duration: 300 }}>{error}</p>
      {/if}
      <form use:form>
        <div class="input-group">
          <input type="email" id="email" class="input-field" name="email" required />
          <label for="email" class="input-label">Email</label>
          <span class="input-highlight"></span>
          <ErrorMessage name="email" />
        </div>
        <div class="input-group">
          <input type="text" id="username" class="input-field" name="username" required />
          <label for="username" class="input-label">Username</label>
          <span class="input-highlight"></span>
          <ErrorMessage name="username" />
        </div>
        <div class="input-group">
          <input type="password" id="password" class="input-field" name="password" required />
          <label for="password" class="input-label">Password</label>
          <span class="input-highlight"></span>
          <ErrorMessage name="password" />
        </div>
        <button type="submit" class="register-button" disabled={isLoading}>
          {#if isLoading}
            <span class="loader"></span>
          {:else}
            Register
          {/if}
        </button>
      </form>
      <p class="login-link">
        Already have an account? <a href="/login" class="link">Login</a>
      </p>
    </div>
  </main>
  
  
  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
  
    main {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #8e2de2, #4a00e0);
      font-family: 'Poppins', sans-serif;
    }
  
    .register-container {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 100%;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }
  
    .register-container::before {
      content: '';
      position: absolute;
      top: -20px;
      left: -20px;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s;
      animation: circleMove 5s linear infinite;
    }
  
    .register-container:hover::before {
      opacity: 1;
    }
  
    @keyframes circleMove {
      0% {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(200px, 0);
      }
      50% {
        transform: translate(200px, 200px);
      }
      75% {
        transform: translate(0, 200px);
      }
      100% {
        transform: translate(0, 0);
      }
    }
  
    .title-container {
      position: relative;
      margin-bottom: 3rem;
    }
  
    .title {
      text-align: center;
      font-size: 2.5rem;
      color: #333333;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .title-underline {
      width: 80px;
      height: 4px;
      background-color: #8e2de2;
      margin: 0 auto;
      border-radius: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  
    .input-group {
      position: relative;
      margin-bottom: 2.5rem;
    }
  
    .input-field {
      width: 100%;
      padding: 1rem 0;
      font-size: 1.1rem;
      color: #333333;
      border: none;
      border-bottom: 2px solid #cccccc;
      background-color: transparent;
      transition: border-color 0.3s;
    }
  
    .input-field:focus {
      outline: none;
      border-bottom-color: #8e2de2;
    }
  
    .input-label {
      position: absolute;
      top: 1rem;
      left: 0;
      font-size: 1.1rem;
      color: #999999;
      pointer-events: none;
      transition: 0.3s;
    }
  
    .input-field:focus ~ .input-label,
    .input-field:valid ~ .input-label {
      top: -1.5rem;
      font-size: 0.9rem;
      color: #8e2de2;
    }
  
    .input-highlight {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #8e2de2;
      transition: width 0.3s;
    }
  
    .input-field:focus ~ .input-highlight {
      width: 100%;
    }
  
    .error {
      color: #ff3b30;
      margin-bottom: 1rem;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }
  
    .register-button {
      display: block;
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
      text-align: center;
      color: #ffffff;
      background-color: #8e2de2;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    }
  
    .register-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.5s;
    }
  
    .register-button:hover {
      background-color: #4a00e0;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }
  
    .register-button:hover::before {
      left: 100%;
    }
  
    .register-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  
    .loader {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  
    .login-link {
      margin-top: 2rem;
      text-align: center;
      color: #666666;
    }
  
    .link {
      color: #8e2de2;
      text-decoration: none;
      transition: color 0.3s;
      position: relative;
    }
  
    .link::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #8e2de2;
      transform: scaleX(0);
      transition: transform 0.3s;
      transform-origin: left;
    }
  
    .link:hover {
      color: #4a00e0;
    }
  
    .link:hover::before {
      transform: scaleX(1);
    }
  </style>