<template>
  <v-app width="100%">
    <v-app-bar app>
      <v-img src="https://picsum.photos/seed/playwright/150/150/?grayscale" :max-width="64"/>
      <v-toolbar-title class="ml-4">Playwright</v-toolbar-title>
      <v-spacer/>
      <v-avatar><img :src="$store.users.current?.public?.avatarUrl"/></v-avatar>
      <span class="ml-4">{{$store.users.current?.public?.name}}</span>
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
