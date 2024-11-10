<!-- Spinner.svelte -->
<div class="spinner">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
  </div>
  
  <style>
    .spinner {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
  
    .spinner div {
      position: absolute;
      top: 33px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #007bff;
      animation: sk-bounce 1.2s infinite ease-in-out both;
    }
  
    .spinner .bounce1 {
      animation-delay: -0.32s;
    }
  
    .spinner .bounce2 {
      animation-delay: -0.16s;
    }
  
    @keyframes sk-bounce {
      0%, 80%, 100% { 
        transform: scale(0);
      } 40% { 
        transform: scale(1.0);
      }
    }
  </style>