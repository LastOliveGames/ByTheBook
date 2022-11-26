<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="mt-12">
        <v-list>
          <template v-for="({group, groupTitle}, i) in playGroups">
            <v-divider v-if="i > 0" :key="`${groupTitle}-divider`"/>
            <v-subheader :key="groupTitle">{{groupTitle}}</v-subheader>
            <v-list-item v-for="item in group" :key="item.playKey" @click="navigate(item)">
              <v-list-item-avatar v-if="item.thumbUrl" tile>
                <v-img :src="item.thumbUrl"/>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.title}}</v-list-item-title>
                <v-list-item-subtitle v-if="item.publisher">
                  by
                  <v-avatar v-if="item.publisher.avatarUrl" size="16">
                    <img :src="item.publisher.avatarUrl"/>
                  </v-avatar>
                  {{item.publisher.name}}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
        <promise-btn color="primary" :disabled="!$info.userid" :onclick="createPlay">
          Create new play
        </promise-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Vue} from ':core/vue-class';
import _ from 'lodash';
import slugify from 'slugify';

// TODO: let user hide / reveal plays from their list; show hidden count and let user show them

const RELATION_MAP = {
  owner: [1, 'Your plays'],
  editor: [2, 'Editing'],
  author: [3, 'Writing'],
  playtester: [4, 'Testing'],
  contributor: [5, 'Contributing'],
  player: [6, 'Playing'],
  publisher: [7, 'Publishing'],
};

export default class HomePage extends Vue {
  created() {
    this.loadPlaysIndex();
  }

  async createPlay() {
    // TODO: let user select publisher under which to create play, if they're a member of multiple
    // ones.
    const playKey = await this.$store.plays.createPlay();
    await this.$router.push(`/plays/untitled/${playKey}/edit`);
  }

  private async loadPlaysIndex() {
    await this.$when(() => this.$info.user);
    this.$store.users.loadPlaysIndex();
  }

  get playGroups() {
    return _(this.$store.users.currentUserPlaysIndex)
      .map((indexEntry, playKey) => {
        const relation = indexEntry.maker ?? (
          indexEntry.publisher ? 'publisher' : indexEntry.player ? 'player' : null
        );
        if (!relation) return;
        const playCore = this.$store.plays[playKey]?.playbill?.core;
        if (!playCore) return;
        const publisher = this.$store.publishers?.[playCore.publisherKey]?.public;
        return {
          title: playCore.title, thumbUrl: playCore.thumbUrl, playKey, relation, publisher
        };
      })
      .compact()
      .groupBy('relation')
      .map((group, relation) => ({
        group, priority: RELATION_MAP[relation][0], groupTitle: RELATION_MAP[relation][1]
      }))
      .sortBy('priority')
      .value();
  }

  async navigate({title, playKey}) {
    const slug = slugify(title, {lower: true, strict: true});
    await this.$router.push(`/plays/${slug}/${playKey}`);
  }
}

</script>
