import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' && repoName ? `/${repoName}/` : './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
