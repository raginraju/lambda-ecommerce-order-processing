import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 1. Added this for path resolution

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    // 2. Added the Alias Configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      allowedHosts: ['.trycloudflare.com', 'localhost'], 
      hmr: {
        clientPort: mode === 'tunnel' ? 443 : undefined, 
        protocol: mode === 'tunnel' ? 'wss' : 'ws',
      },
    },
  }
})