<script>
    // export let user;

    export let user = {
    avatar: '',
    name: '',
    email: '',
    articlesCount: 0,
    followersCount: 0,
    followingCount: 0
  };
  </script>
  
  <div class="user-profile">
    <div class="profile-header">
      <img src="{user.avatar}" alt="{user.name}" class="profile-avatar">
      <h2 class="profile-name">{user.name}</h2>
      <p class="profile-email">{user.email}</p>
    </div>
    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-value">{user.articlesCount}</span>
        <span class="stat-label">Artículos</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{user.followersCount}</span>
        <span class="stat-label">Seguidores</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{user.followingCount}</span>
        <span class="stat-label">Siguiendo</span>
      </div>
    </div>
    <div class="profile-actions">
      <a href="/perfil" class="btn btn-primary">Ver Perfil</a>
      <a href="/ajustes" class="btn btn-secondary">Ajustes</a>
    </div>
  </div>
  
  <style>
    .user-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .profile-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
  
    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
    }
  
    .profile-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  
    .profile-email {
      font-size: 1rem;
      color: #6c757d;
    }
  
    .profile-stats {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: 1.5rem;
    }
  
    .stat-item {
      text-align: center;
    }
  
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #007bff;
    }
  
    .stat-label {
      font-size: 0.9rem;
      color: #6c757d;
    }
  
    .profile-actions {
      display: flex;
      gap: 1rem;
    }
  
    .btn {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s, color 0.3s;
    }
  
    .btn-primary {
      color: #fff;
      background-color: #007bff;
    }
  
    .btn-primary:hover {
      background-color: #0056b3;
    }
  
    .btn-secondary {
      color: #007bff;
      background-color: #fff;
      border: 1px solid #007bff;
    }
  
    .btn-secondary:hover {
      color: #fff;
      background-color: #007bff;
    }
  </style>