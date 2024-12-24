<!-- src/lib/components/curso/CourseSidebar.svelte -->
<script>
    export let curso;
    export let enrollmentButtonText;
    export let enrollmentButtonClass;
    export let enrollmentButtonAction;
    export let isEnrollmentButtonDisabled;
    export let onShowRating;
    export let enrollmentStatus = "";
  </script>
  
  <aside class="course-sidebar">
    <div class="sidebar-card">
      <div class="course-preview">
        <img
          src={curso.imagen_principal_url || "/default-course-image.jpg"}
          alt={curso.titulo}
          class="preview-image"
          loading="lazy"
        />
      </div>
      <div class="course-price">
        <span class="price">${Math.round(curso.precio || 0)}</span>
        {#if curso.precio_original}
          <span class="original-price">${Math.round(curso.precio_original)}</span>
          <span class="discount">
            {Math.round((1 - (curso.precio || 0) / curso.precio_original) * 100)}% de descuento
          </span>
        {/if}
      </div>
      <div class="course-actions">
        <button 
          class={`btn ${enrollmentButtonClass}`}
          on:click={enrollmentButtonAction}
          disabled={isEnrollmentButtonDisabled}
          aria-disabled={isEnrollmentButtonDisabled}
        >
          <i class={["aprobada", "inscrito"].includes(enrollmentStatus) ? "fas fa-graduation-cap" : "fas fa-sign-in-alt"}></i>
          {enrollmentButtonText}
        </button>
        {#if ["aprobada", "inscrito"].includes(enrollmentStatus)}
          <button class="btn btn-secondary" on:click={onShowRating}>
            <i class="fas fa-star"></i> Calificar curso
          </button>
        {/if}
      </div>
      <ul class="course-highlights">
        <li><i class="fas fa-infinity"></i> Acceso de por vida</li>
        <li><i class="fas fa-mobile-alt"></i> Acceso en dispositivos móviles y TV</li>
        <li><i class="fas fa-certificate"></i> Certificado de finalización</li>
        <li><i class="fas fa-file-download"></i> Recursos descargables</li>
        <li><i class="fas fa-comments"></i> Foro de discusión</li>
        <li><i class="fas fa-language"></i> Subtítulos en varios idiomas</li>
      </ul>
    </div>
  </aside>
  
  <style>
    .course-sidebar {
      width: 320px;
      position: sticky;
      top: 2rem;
      align-self: flex-start;
    }
  
    .sidebar-card {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .sidebar-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
  
    .course-preview {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
  
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  
    .course-price {
      padding: 1.5rem;
      text-align: center;
      border-bottom: 2px solid #ecf0f1;
      position: relative;
    }
  
    .price {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }
  
    .original-price {
      font-size: 1rem;
      color: #7f8c8d;
      text-decoration: line-through;
      margin-left: 0.5rem;
    }
  
    .discount {
      display: block;
      font-size: 0.9rem;
      color: #27ae60;
      margin-top: 0.3rem;
    }
  
    .course-actions {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.7rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      gap: 0.5rem;
    }
  
    .btn-primary {
      background-color: #3498db;
      color: white;
    }
  
    .btn-primary:hover {
      background-color: #2980b9;
    }
  
    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    } 
  
    .btn-secondary:hover {
      background-color: #7f8c8d;
    }
  
    .btn-success {
      background-color: #2ecc71;
      color: white;
    }
  
    .btn-success:hover {
      background-color: #27ae60;
    }
  
    .btn-warning {
      background-color: #f39c12;
      color: white;
    }
  
    .btn-warning:hover {
      background-color: #d35400;
    }
  
    .btn-danger {
      background-color: #e74c3c;
      color: white;
    }
  
    .btn-danger:hover {
      background-color: #c0392b;
    }
  
    .btn:disabled, .btn[aria-disabled="true"] {
      background-color: #bdc3c7;
      cursor: not-allowed;
      opacity: 0.7;
    }
  
    .course-highlights {
      list-style-type: none;
      padding: 1.5rem;
      margin: 0;
      border-top: 2px solid #ecf0f1;
    }
  
    .course-highlights li {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 1rem;
      color: #2c3e50;
    }
  
    .course-highlights li:last-child {
      margin-bottom: 0;
    }
  
    .course-highlights i {
      margin-right: 0.8rem;
      color: #3498db;
      font-size: 1.2rem;
    }
  
    @media (max-width: 1200px) {
      .course-sidebar {
        width: 100%;
        margin-top: 2rem;
        position: static;
      }
    }
  
    @media (max-width: 768px) {
      .course-sidebar {
        width: 100%;
        margin-top: 2rem;
        position: static;
      }
  
      .sidebar-card {
        width: 100%;
      }
    }
  </style>  