import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],

  optimizeDeps: {
    exclude: ['opencv-ts'],
    include: ['@imgly/background-removal']
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-redux'],
          'ai-models': ['@imgly/background-removal'],
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl'],
          'opencv': ['opencv-ts'],
          'ui': ['framer-motion', 'react-dropzone', 'react-hot-toast']
        }
      }
    }
  },

  server: {
    port: 3000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
