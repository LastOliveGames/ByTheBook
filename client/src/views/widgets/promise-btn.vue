<template>
  <v-tooltip
      bottom color="error"
      :open-on-click="false"
      :open-on-focus="false"
      :open-on-hover="false"
      v-model="showingError"
      v-click-outside="handleClickOutside">
    <template #activator="{on}">
      <v-btn v-bind="$attrs" v-on="on" :loading="loading" @click="handleClick">
        <slot/>
      </v-btn>
    </template>
    {{errorMessage}}
  </v-tooltip>
</template>

<script lang="ts">
import {Vue, prop} from ':core/vue-class';

export default class PromiseBtn extends Vue {
  onclick = prop.required.function<(ev) => unknown | Promise<unknown>>();
  loading = false;
  errorMessage = undefined;
  showingError = false;

  async handleClick(ev) {
    this.errorMessage = undefined;
    this.showingError = false;
    this.loading = true;
    ev.stopPropagation();
    try {
      await this.onclick(ev);
    } catch (e) {
      this.errorMessage = e.toString();
      this.showingError = true;
    } finally {
      this.loading = false;
    }
  }

  handleClickOutside() {
    this.showingError = false;
  }
}

</script>
