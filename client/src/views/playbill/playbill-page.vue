<template>
  <div>
  </div>
</template>

<script lang="ts">
import {Vue, prop} from ':core/vue-class';

// TODO: display a landing page for a play, with options to play or edit (if appropriate).
// TODO: figure out how to make play landing pages indexable by search engines.

export default class PlaybillPage extends Vue {
  titleSlug = prop.string();
  playKey = prop.required.string();
}

</script>
