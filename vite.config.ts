import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // honor the port assigned by the preview harness (PORT env var)
    port: Number(process.env.PORT) || 3969,
  },
})
