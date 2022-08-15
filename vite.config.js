import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import DefineOptions from 'unplugin-vue-define-options/vite'

const common = {
  resolve: {
    alias: {
      '@': '/src'
    }
  },
}

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // 开发环境
    return {
      ...common,
      plugins: [
        vue(),
        DefineOptions(),
      ],
    }
  } else if (command === 'build') {
    // 打包环境
    return {
      ...common,
      base: './',
      plugins: [
        vue(),
        DefineOptions(),
      ],
      terserOptions: {
        compress: {
          // 打包去掉 console
          drop_console: command !== 'serve',
          // 打包去掉 debugger
          drop_debugger: command !== 'serve'
        }
      }
    }
  } else {
    return common
  }
})
