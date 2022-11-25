import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import vueClass from '../build/vite-plugin-vue-class';
import components from 'unplugin-vue-components/vite';
import {VuetifyResolver as vuetifyResolver} from 'unplugin-vue-components/resolvers';
import {checker} from 'vite-plugin-checker';
import fireplan from '../build/vite-plugin-fireplan';
import trussModels from '../build/vite-plugin-truss-models';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 2000,
    sourcemap: true,
  },
  plugins: [
    inspect(),
    checker({
      enabledBuild: true,
      vueTsc: true,
      typescript: {root: '../functions', buildMode: true},  // doesn't run in build mode?
      eslint: {lintCommand: 'eslint --ext .js,.ts,.vue src ../functions/src'}
    }),
    fireplan('../schema.yaml'),
    trussModels(),
    vueClass(),
    tsconfigPaths({loose: true}),
    vue(),
    components({transformer: 'vue2', version: 2.7, resolvers: [vuetifyResolver()]}),
  ]
});


// TODO: consider enhancing all member assignments to Vue.set (and delete to Vue.delete).
// TODO: patch Lodash so it calls the reactive versions of array methods.
