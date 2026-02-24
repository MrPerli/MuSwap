import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': {}, // 解决 process.env 相关的报错
  },
  plugins: react(),
  resolve: {
    alias: {
      '@Mu': '/src',
      '@MuAssets': '/src/assets',
      '@MuComponents': '/src/components',
      '@MuConfig': '/src/config',
      '@MuGraphql': '/src/graphql',
      '@MuHooks': '/src/hooks',
      '@MuLibs': '/src/libs',
      '@MuPages': '/src/pages',
      '@MuRouters': '/src/routers',
      '@MuServices': '/src/services',
      '@MuTypes': '/src/types',
      '@MuUtils': '/src/utils',
    }
  },
})
