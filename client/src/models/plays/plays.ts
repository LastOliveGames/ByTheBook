import Truss from 'firetruss';

export default class Plays extends Truss.Model {
  async createPlay(publisherKey?: string): Promise<string> {
    return await Truss.worker.callServerFunction('createPlay', {publisherKey});
  }
}
