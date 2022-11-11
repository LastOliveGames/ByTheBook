import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueClass from '../build/vite-plugin-vue-class';
import components from 'unplugin-vue-components/vite';
import {VuetifyResolver as vuetifyResolver} from 'unplugin-vue-components/resolvers';
import checker from 'vite-plugin-checker';
import fireplan from '../build/vite-plugin-fireplan';

export default defineConfig({
  plugins: [
    inspect(),
    checker({
      vueTsc: true,
      typescript: {root: 'functions', buildMode: true},
      eslint: {lintCommand: 'eslint --ext .js,.ts,.vue src ../functions/src'}
    }),
    fireplan('../schema.yaml'),
    vueClass(),
    tsconfigPaths({loose: true}),
    vue(),
    components({transformer: 'vue2', version: 2.7, resolvers: [vuetifyResolver()]}),
  ]
});
