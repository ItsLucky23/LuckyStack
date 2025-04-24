import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';
// import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // tsconfigPaths()
  ],
  // clearScreen: false,
  build: {
    // rollupOptions: {
    //   external: (id) => /\/api\//.test(id) // Matches only full "api" folders
    // },
    rollupOptions: {
      external: (id) => { // this is just for the server side to tell these files will be available at runtime, to ignore files in build process go to tsconfig.app.json
        // Match if path includes /api/
        if (/\/api\//.test(id)) return true;
  
        // Ignore files in a sync folder ending with _server.ts
        if (/\/sync\/.*\/.*_server\.ts$/.test(id) || /\/sync\/.*_server\.ts$/.test(id)) return true;

        return false;
      },
    },
    target: 'esnext', // This makes sure the server redirects all 404s to index.html
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  }
})
