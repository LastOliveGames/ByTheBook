import Truss from 'firetruss';

export default class Users extends Truss.Model {
  _currentUserConnector?: Truss.Connector;

  constructor() {
    super();
    this.$observe(() => this.$info.user, this._updateUser);
  }

  _updateUser(user, oldUser) {
    if (user === undefined) return;
    if (user === null) {
      if (oldUser) this._currentUserConnector?.destroy();
      this.$truss.authenticate();
    } else {
      this._currentUserConnector =
        this.$connect(this.$store.$ref.child('users', user.uid, 'core')!);
    }
  }

  get current() {
    if (!this.$info.userid) return this.$info.userid;
    return this[this.$info.userid];
  }
}
