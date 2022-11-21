import Truss from 'firetruss';

export default class Plays extends Truss.Model {
  async createPlay(): Promise<string> {
    return await Truss.worker.callServerFunction('createPlay');
  }
}
