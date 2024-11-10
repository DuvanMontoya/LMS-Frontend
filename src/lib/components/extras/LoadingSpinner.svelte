<script>
    export let size = '50px';
    export let color = '#3498db';
  </script>
  
  <div class="spinner-container">
    <div class="spinner" style="width: {size}; height: {size}; border-color: {color} transparent {color} transparent;">
    </div>
  </div>
  
  <style>
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  
    .spinner {
      border: 4px solid;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  </style>