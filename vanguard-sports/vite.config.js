import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production debugging (can disable for smaller builds)
    sourcemap: false,

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Minification (esbuild is faster and built-in)
    minify: 'esbuild',

    // Esbuild options
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.logs and debugger in production
    },

    // Rollup optimization options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'lucide-icons': ['lucide-react'],

          // Feature chunks
          'parent-views': [
            './src/views/parent/ParentDashboard.jsx',
            './src/views/parent/AccountSettings.jsx',
            './src/views/parent/FamilyManagement.jsx',
            './src/views/parent/BillingPortal.jsx',
          ],
          'coach-views': [
            './src/views/coach/tabs/AthletesTab.jsx',
            './src/views/coach/tabs/EvaluationsTab.jsx',
          ],
          'admin-views': [
            './src/views/admin/AdminDashboard.jsx',
          ],
          'services': [
            './src/services/api.js',
            './src/services/authService.js',
            './src/services/userService.js',
            './src/services/sessionService.js',
            './src/services/athleteService.js',
            './src/services/enrollmentService.js',
            './src/services/evaluationService.js',
          ],
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // CSS code splitting
    cssCodeSplit: true,
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },

  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
  },
})
