<script>
    export let autor;
  </script>
  
  <section class="author-info">
    <div class="author-header">
      <div class="author-image-container">
        <img src={autor.avatar || "https://www.labsaenzrenauld.com/wp-content/uploads/2020/10/Perfil-hombre-ba%CC%81sico_738242395.jpg"} alt={autor.username || 'autor'} class="author-image" />
        <div class="author-image-overlay"></div>
      </div>
      <h3 class="author-name">{autor.nombre}</h3>
      <p class="author-role">{autor.rol || 'No especificado'}</p>
    </div>
    <p class="author-bio">{autor.bio || 'No hay biografía disponible.'}</p>
    <div class="author-social">
      {#if autor.twitter}
        <a href={autor.twitter} class="social-link twitter" target="_blank" aria-label="Twitter">
          <i class="fab fa-twitter"></i>
        </a>
      {/if}
      {#if autor.linkedin}
        <a href={autor.linkedin} class="social-link linkedin" target="_blank" aria-label="LinkedIn">
          <i class="fab fa-linkedin"></i>
        </a>
      {/if}
      {#if autor.github}
        <a href={autor.github} class="social-link github" target="_blank" aria-label="GitHub">
          <i class="fab fa-github"></i>
        </a>
      {/if}
    </div>
  </section>
  
  <style>
    .author-info {
      background-color: #ffffff;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin: 2rem auto;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
      overflow: hidden;
      width: 80%;
      max-width: 400px;
    }
  
    .author-info:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
    }
  
    .author-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1rem;
    }
  
    .author-image-container {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin-bottom: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }
  
    .author-image-container:hover {
      transform: scale(1.1);
    }
  
    .author-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
  
    .author-image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 1.2rem;
      text-transform: uppercase;
    }
  
    .author-image-container:hover .author-image-overlay {
      opacity: 1;
    }
  
    .author-name {
      font-size: 1.6rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.3rem;
      transition: color 0.3s;
    }
  
    .author-info:hover .author-name {
      color: #007bff;
    }
  
    .author-role {
      font-size: 1.1rem;
      color: #777;
      margin-bottom: 1rem;
    }
  
    .author-bio {
      font-size: 1rem;
      color: #555;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
  
    .author-social {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }
  
    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #fff;
      text-decoration: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: background-color 0.3s, transform 0.3s;
      position: relative;
      overflow: hidden;
    }
  
    .social-link::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
  
    .social-link:hover {
      transform: scale(1.2);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  
    .social-link:hover::before {
      opacity: 1;
    }
  
    .social-link.twitter {
      background-color: #1da1f2;
    }
  
    .social-link.linkedin {
      background-color: #0077b5;
    }
  
    .social-link.github {
      background-color: #333;
    }
  </style>
  