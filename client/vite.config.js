import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueClass from './build/vite-plugin-vue-class';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    inspect(),
    vueClass(),
    tsconfigPaths({loose: true}),
    vue(),
  ]
});
