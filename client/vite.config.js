import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueClass from './build/vite-plugin-vue-class';
import components from 'unplugin-vue-components/vite';
import {VuetifyResolver as vuetifyResolver} from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    inspect(),
    vueClass(),
    tsconfigPaths({loose: true}),
    vue(),
    components({transformer: 'vue2', version: 2.7, resolvers: [vuetifyResolver()]}),
  ]
});
