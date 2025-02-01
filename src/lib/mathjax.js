// src/lib/mathjax.js
import { onMount } from "svelte";
import { MathJax } from "mathjax/es5/tex-mml-chtml.js";

export function useMathJax() {
  onMount(() => {
    MathJax.typesetPromise();
  });
}

export function typesetMath() {
  if (window.MathJax) {
    window.MathJax.typesetPromise();
  }
}
