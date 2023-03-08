import {Clerk} from ':helpers/clerk';
import Truss from 'firetruss';

export default class Editor extends Truss.Model {
  clerk = new Clerk(this);
}
