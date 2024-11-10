<script>
    import { onMount } from 'svelte';
  
    onMount(() => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Lobster&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
  </script>

<style>
    .logo {
      font-family: 'Lobster', sans-serif;
      font-weight: 500;
      font-size: 2.2rem;
      color: #0D47A1;
      background: linear-gradient(90deg, #0c0649, #020118);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: transform 0.3s, box-shadow 0.3s;
    }
  
    .logo:hover {
      transform: scale(1.05);
    }
  
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
  
  <div class="container">
    <div class="logo">Laila</div>
  </div>
  