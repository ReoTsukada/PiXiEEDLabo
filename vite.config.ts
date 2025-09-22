import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/PiXiEEDLabo/',
  plugins: [react()],
  server: {
    host: true
  }
});
