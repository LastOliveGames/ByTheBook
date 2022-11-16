<template>
  <div>
    <h1>{{ msg }}</h1>

    <div class="card">
      <button type="button" @click="increment">count is {{ count }}</button>
      <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <p>
      Check out
      <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
        >create-vue</a
      >, the official Vue + Vite starter
    </p>
    <p>
      Install
      <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
      in your IDE for a better DX
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  </div>
</template>

<script lang="ts">

import {prop} from ':core/vue-class';
import Vue from 'vue';

export default class HelloWorld extends Vue {
  msg = prop.required.string();

  created() {
    this.$watch(() => this.count, () => {/* nothing */});
    this.$connect(this.$store.$ref.child('system'));
  }

  get count() {
    if (!this.$store.system.$ref.ready) return;
    return this.$store.system.count ?? 0;
  }

  increment() {
    return this.$store.system.incrementCounter();
  }
}

</script>

<style scoped>

.read-the-docs {
  color: #888;
}

</style>
