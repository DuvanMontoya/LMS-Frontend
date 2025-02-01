// src/mathjax.js
import { onMount } from "svelte";
import { MathJax } from "mathjax/es5/tex-mml-chtml.js";

export function useMathJax() {
  onMount(() => {
    if (window.MathJax) {
      MathJax.typesetPromise();
    } else {
      MathJax.startup.promise.then(() => {
        MathJax.typesetPromise();
      });
    }
  });
}

export function typesetMath() {
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}
