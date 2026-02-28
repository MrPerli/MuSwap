import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 是否包含 node 内置模块的 polyfill
      include: ['stream', 'crypto', 'util', 'buffer', 'process', 'vm'],
      // 是否需要全局变量，比如 Buffer, process
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    'global': {},
    'process.env': {}, // 有些库需要 process.env
    'Buffer': ['buffer', 'Buffer'],
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
