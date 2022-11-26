import Truss from 'firetruss';
import _ from 'lodash';
import User from './users.$userid';
import adjectives from 'codename-generator/adjectives.json';
import nouns from 'codename-generator/nouns.json';

export default class Users extends Truss.Model {
  private currentUserConnector?: Truss.Connector;
  private playsIndexConnector?: Truss.Connector;
  private includeHidden = false;

  constructor() {
    super();
    this.$observe(() => this.$info.user, this.updateUser);
  }

  // TODO: figure out what to do about authentication, and how we're going to get user names and
  // avatars.
  private updateUser(user, oldUser) {
    if (user === undefined) return;
    if (user === null) {
      this.currentUserConnector?.destroy();
      this.currentUserConnector = undefined;
      this.playsIndexConnector?.destroy();
      this.playsIndexConnector = undefined;
      this.$truss.authenticate();
    } else if (!this.currentUserConnector) {  // should be undefined, but check just in case
      this.currentUserConnector = this.$connect(
        this.$store.$ref.child('users', user.uid, 'public')!);
    }
  }

  get current(): User | undefined | null {
    if (_.isNil(this.$info.userid)) return this.$info.userid;
    return this[this.$info.userid];
  }

  private get generateName() {
    if (!this.$info.userid || !this.currentUserConnector?.ready) return false;
    const name = `${_.capitalize(_.sample(adjectives)!)} ${_.capitalize(_.sample(nouns)!)}`;
    this.$ref.child('users', this.$info.userid, 'public').set({
      name, avatarUrl: `https://picsum.photos/seed/${name.replace(/ /g, '+')}/512/512`
    });
    return true;
  }

  // TODO: consider caching plays index in local storage for faster load, but it may not make much
  // of a difference unless we also cache play and publisher data.

  loadPlaysIndex(includeHidden = false): void {
    this.includeHidden = includeHidden;
    if (!this.$info.userid || this.playsIndexConnector) return;
    // We load all the play data here rather than in a component, so we'll keep it in memory for
    // faster navigation and reduced bandwidth usage.
    this.playsIndexConnector = this.$connect({
      index: this.$store.$ref.child('users', this.$info.userid, 'indexes', 'plays')!,
      plays: () => this.$store.$ref.children('plays', this.currentUserPlayKeys, 'playbill', 'core'),
      publishers:
        () => this.$store.$ref.children('publishers', this.currentUserPlaysPublisherKeys, 'public'),
    });
  }

  get currentUserPlaysIndex() {
    return this.$store.users.current?.indexes?.plays?.contents;
  }

  private get currentUserPlayKeys() {
    if (this.includeHidden) return _.keys(this.currentUserPlaysIndex);
    return _(this.currentUserPlaysIndex).omitBy({hidden: true}).keys().value();
  }

  private get currentUserPlaysPublisherKeys() {
    return _(this.currentUserPlayKeys)
      .map(playKey => this.$store.plays[playKey]?.playbill?.core?.publisherKey)
      .compact()
      .uniq()
      .value();
  }
}
