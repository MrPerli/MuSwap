import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 是否全局注入 Buffer、process 等
      globals: {
        Buffer: true,
        process: true,
      },
      // 需要 polyfill 的 Node.js 核心模块
      protocolImports: true,
    }),
  ],
  define: {
    ///'global': {},
    'process.env': {}, // 有些库需要 process.env
    //'Buffer': ['buffer', 'Buffer'],
  },
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
