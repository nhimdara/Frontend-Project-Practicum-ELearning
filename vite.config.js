import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    watch: {
      // Android/Gradle caches can contain tens of thousands of files. They are
      // unrelated to the web app and can exhaust Linux's inotify watch limit.
      ignored: [
        '**/android/**',
        '**/.gradle/**',
        '**/dist/**',
        '**/.git/**',
      ],
    },
  },
})
