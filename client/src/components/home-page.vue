<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="mt-12">
        <promise-btn
          color="primary"
          :disabled="!$info.userid"
          :onclick="createPlay"
        >Create new play</promise-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Vue} from ':core/vue-class';

export default class HomePage extends Vue {
  createPlay() {
    return this.$store.plays.createPlay();
  }
}

</script>
