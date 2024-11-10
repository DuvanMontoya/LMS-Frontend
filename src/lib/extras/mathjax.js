import { onMount } from 'svelte';

export function renderMathJax() {
  if (typeof MathJax !== 'undefined') {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  } else {
    console.warn('MathJax is not loaded');
  }
}

export function loadMathJax() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    script.onload = () => {
      MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          processEscapes: true,
        },
      });
      MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load MathJax'));
    };
    document.head.appendChild(script);
  });
}

export function renderTikzJax() {
  if (typeof tikzjax !== 'undefined') {
    tikzjax.processAll();
  } else {
    console.warn('TikZJax is not loaded');
  }
}

export function loadTikzJax() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://tikzjax.com/v1/tikzjax.js';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load TikZJax'));
    };
    document.head.appendChild(script);
  });
}

export function initMathJax() {
  onMount(() => {
    loadMathJax()
      .then(() => {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
      })
      .catch((error) => {
        console.error('Error loading MathJax:', error);
      });
  });
}

export function initTikzJax() {
  onMount(() => {
    loadTikzJax()
      .then(() => {
        tikzjax.processAll();
      })
      .catch((error) => {
        console.error('Error loading TikZJax:', error);
      });
  });
}


