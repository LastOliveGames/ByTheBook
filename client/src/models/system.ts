import Truss from 'firetruss';

export default class System extends Truss.Model {
  incrementCounter() {
    return this.$ref.child('count')!.commit(txn => {
      txn.set((txn.currentValue ?? 0) + 1);
    });
  }
}
