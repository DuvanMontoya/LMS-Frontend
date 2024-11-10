<script>
    export let title = '';
    export let value = 0;
    export let icon = '';
    export let color = '#007bff';
  </script>
  
  <div class="stat-card">
    <div class="icon" style="background-color: {color};">
      <i class="fas fa-{icon}"></i>
    </div>
    <div class="content">
      <h3 class="title">{title}</h3>
      <p class="value">{value}</p>
    </div>
  </div>
  
  <style>
    .stat-card {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
  
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 20px;
      color: #fff;
      font-size: 24px;
    }
  
    .content {
      flex: 1;
    }
  
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  
    .value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  </style>