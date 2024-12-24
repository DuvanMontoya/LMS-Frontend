import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@sveltejs/svelte-virtual-list': path.resolve('./node_modules/@sveltejs/svelte-virtual-list'),
      'svelte-toasts': path.resolve('./node_modules/svelte-toasts')
    }
  },
  optimizeDeps: {
    include: ['@sveltejs/svelte-virtual-list', 'svelte-toasts']
  }
});
