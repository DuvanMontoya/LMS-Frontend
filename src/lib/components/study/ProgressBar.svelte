<!-- src/lib/components/study/ProgressBar.svelte -->
<script>
    export let progress = 0;
  </script>
  
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>
  
  <style>
    .progress-bar {
      height: 0.5rem;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
  
    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 9999px;
      transition: width 0.5s ease;
    }
  </style>  