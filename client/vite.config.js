import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    inspect(),
    tsconfigPaths({loose: true}),
    vue(),
  ]
});
