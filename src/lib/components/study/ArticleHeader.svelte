<!-- src/lib/components/study/ArticleHeader.svelte -->
<script>
    import ProgressBar from '$lib/components/study/ProgressBar.svelte';
    
    export let title;
    export let description;
    export let progress;
    export let progressText = "Progreso del estudio";
    export let progressPercentage;
  </script>
  
  <header class="article-header">
    <h1>{title}</h1>
    <p class="subtitle">{description}</p>
    <div class="progress-container">
      <div class="progress-info">
        <span class="progress-text">{progressText}</span>
        <span class="progress-percentage">{progressPercentage}%</span>
      </div>
      <ProgressBar {progress} />
    </div>
  </header>
  
  <style>
    .article-header {
      padding: 2rem;
      background: linear-gradient(to right, #f8fafc, #f1f5f9);
      border-bottom: 1px solid #e2e8f0;
    }
  
    .article-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }
  
    .subtitle {
      font-size: 1.1rem;
      color: #64748b;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
  
    .progress-container {
      background: white;
      padding: 1.25rem;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
  
    .progress-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }
  
    .progress-percentage {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }
  </style>  