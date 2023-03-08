import Truss from 'firetruss';
import Editor from './services.editors.$playKey';

export default class Editors extends Truss.Model {
  create(playKey: string): Editor {
    this.$ref.child(playKey).set({active: true});
    return this.$data[playKey] as Editor;
  }
}
