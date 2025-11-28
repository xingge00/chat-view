import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import htmlMinifierTerser from 'vite-plugin-html-minifier-terser'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_PUBLIC_PATH || '/', // 设置打包路径
    plugins: [
      vue(),
      htmlMinifierTerser(),
      legacy({
        targets: ['defaults', 'ie >= 11', 'chrome >= 49'], // 需要兼容的目标列表，可以设置多个
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        modernPolyfills: true,
      }),
    ],
    resolve: {
      alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
      extensions: ['.vue', '.js'],
    },
    css: {
      preprocessorOptions: {
        scss: { },
      },
    },
    server: {
      port: 8848, // 设置服务启动端口号
      open: true, // 设置服务启动时是否自动打开浏览器
      cors: true, // 允许跨域
      host: '0.0.0.0',
      proxy: {
        '/nursing-management': {
          target: 'http://crkms.cr-health.com:4601',
          changeOrigin: true,
          ws: true,
        },
      },
    },

  }
})
