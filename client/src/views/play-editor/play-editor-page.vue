<template>
  <div>
    <v-text-field outlined label="Title"
      v-model="playbill.core.title.$value" :rules="playbill.core.title.$rules"/>
  </div>
</template>

<script lang="ts">
import {Vue, prop, form} from ':core/vue-class';

export default class PlayEditorPage extends Vue {
  titleSlug = prop.string();
  playKey = prop.required.string();

  private remixKey = 'base';

  playbill = form({
    core: {
      title: form.required.string()
    },
    teaser: form.string(),
    moods: {
      m0: {
        lo: form.required({togetherWith: ['moods.m0.hi']}).string(),
        hi: form.required({togetherWith: ['moods.m0.lo']}).string()
      }
    }
  });

  created() {
    this.$store.services.editors.create(this.playKey);
    this.$connect(this.$store.$ref.child('plays', this.playKey));

    const root = this.$store.$ref;
    this.$store.services.editors[this.playKey].clerk.register(
      root.child('plays', this.playKey, 'playbill', 'lock'),
      false,
      [{
        form: this.playbill,
        sharedRef: root.child('plays', this.playKey, 'playbill'),
        editableRef: root.child('users', this.$info.userid, 'edits', this.playKey, 'playbill')
      }]
    );
  }
}

</script>
