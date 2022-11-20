<template>
  <div>
  </div>
</template>

<script lang="ts">
import {Vue, prop} from ':core/vue-class';

export default class PlayEditorPage extends Vue {
  titleSlug = prop.string();
  playKey = prop.required.string();
}

</script>
