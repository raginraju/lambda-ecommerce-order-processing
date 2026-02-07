import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  // Check if we are in "development" mode (npm run dev)
  const isDev = command === 'serve';

  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    server: {
      // Allow Cloudflare hosts if needed, but also allow localhost
      allowedHosts: ['.trycloudflare.com', 'localhost'], 
      hmr: {
        // Only use 443 if you are specifically testing the Cloudflare Tunnel
        // Otherwise, let it use the default port (5173)
        clientPort: mode === 'tunnel' ? 443 : undefined, 
        protocol: mode === 'tunnel' ? 'wss' : 'ws',
      },
    },
  }
})