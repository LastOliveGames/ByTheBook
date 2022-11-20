<template>
  <v-app width="100%">
    <v-app-bar app>
      <v-app-bar-title>Playwright</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-footer app padless>
      <v-row justify="center" no-gutters>
        <v-col cols="12" class="primary lighten-2 py-4 text-center white--text">
          Copyright ©2022 Last Olive Games
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default class App extends Vue {
}

</script>
