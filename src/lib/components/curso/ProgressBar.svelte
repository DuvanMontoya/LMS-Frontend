<script>
    export let value = 0;
    export let label = '';
    export let color = '#007bff';
  </script>
  
  <div class="progress-bar">
    <div class="progress" style="width: {value}%; background-color: {color};">
      <span class="label">{label}</span>
    </div>
  </div>
  
  <style>
    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
    }
  
    .progress {
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .label {
      color: #fff;
      font-weight: bold;
      font-size: 14px;
    }
  </style>