<template>
  <div>
    <h1>Goodbye {{upperMsg}}</h1>
  </div>
</template>

<script lang="ts">

import HelloWorld from './HelloWorld.vue';
import Truss from 'firetruss';
import ':core/truss';

export default class GoodbyeWorld extends HelloWorld {
  upperMsg = '';

  created() {
    (async() => {
      this.upperMsg = await Truss.worker.callServerFunction('toUpperCase', {text: this.msg});
    })();
  }
}

</script>
