import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // base: '/dist/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // 将 '@' 映射到 'src' 目录
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080, // 你想要的端口号
  },
})