import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/nps': {
          target: 'https://developer.nps.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/nps/, '/api/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.NPS_API_KEY) {
                proxyReq.setHeader('X-Api-Key', env.NPS_API_KEY)
              }
            })
          },
        },
      },
    },
  }
})
