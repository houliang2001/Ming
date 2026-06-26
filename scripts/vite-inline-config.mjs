import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export function createInlineViteConfig(mode = 'development') {
  return {
    root: projectRoot,
    configFile: false,
    mode,
    plugins: [vue()],
    optimizeDeps: {
      include: ['qrcode'],
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
    },
  }
}
