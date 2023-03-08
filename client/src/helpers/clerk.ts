import Truss from 'firetruss';
import _ from 'lodash';
import {log} from '../core/debug';

export interface Converter {
  toForm(value: string | number | boolean): any;
  toFirebase(value: string | number | boolean): string | number | boolean;
}

export interface Field {
  path: string[];
  convert: Converter;
  ready: boolean;
  dirty: boolean;
}

export class Form {
  private readonly $fields: Field[];
  private readonly $debouncedFlush: () => any;
  private $root?: Truss.Reference = undefined;
  private $unbindRoot?: () => void;
  private $onWrite?: () => void;
  private $flushPromise = Promise.resolve();

  constructor(private readonly $vue: Vue, {skeleton, fields}: {skeleton: any, fields: Field[]}) {
    _.assign(this, _.cloneDeepWith(skeleton, value => _.isFunction(value) ? value : undefined));
    this.$fields = fields;
    this.$debouncedFlush = _.debounce(this.$flush.bind(this), 500, {maxWait: 5000});
    for (const field of fields) this.$bindField(field);
  }

  get $ready(): boolean {
    return _.every(this.$fields, 'ready');
  }

  get $dirty(): boolean {
    return _.some(this.$fields, 'dirty');
  }

  async $flush(): Promise<void> {
    if (this.$onWrite || !this.$root) return this.$flushPromise;
    const updates = {};
    for (const field of this.$fields) {
      if (!field.dirty) continue;
      const model = _.get(this, field.path);
      const value = model?.$value;
      if (_.every(model?.$rules, rule => rule(value) === true)) {
        updates[this.$root!.child(...field.path).path] = value ?? null;
        field.dirty = false;
      }
    }
    if (_.isEmpty(updates)) return this.$flushPromise;
    log.forms('flushing form with', _.size(updates), 'updates');
    const updatePromise = this.$root!.update(updates);
    this.$flushPromise = this.$flushPromise.then(() => updatePromise);
    await updatePromise;
    log.forms('form flushed');
    return this.$flushPromise;
  }

  $bind(root: Truss.Reference | (() => Truss.Reference | undefined), onWrite?: () => void): void {
    log.forms('binding root', root);
    this.$onWrite = onWrite;
    this.$unbindRoot?.();
    if (_.isFunction(root)) {
      this.$unbindRoot = this.$vue.$observe(root, ref => {
        log.forms('root changed', ref);
        if (ref ? ref.isEqual(this.$root) : !this.$root) return;
        log.forms('setting root');
        this.$root = ref;
        this.$flush();
      });
    } else {
      this.$root = root;
      this.$unbindRoot = undefined;
    }
  }

  $resetToFirebaseValues() {
    for (const field of this.$fields) {
      if (!field.ready || !this.$root) continue;
      _.get(this, field.path).$value = _.get(this.$root.value, field.path);
    }
  }

  private async $bindField(field: Field) {
    log.forms('bindField', field.path);
    const model = _.get(this, field.path);
    model.$rules = _.map(model.$rules, rule => rule.bind(this));
    await this.$vue.$when(() => this.$root?.child(...field.path).ready);
    log.forms('field ready', field.path);
    this.$vue.$observe(() => _.get(this.$root?.value, field.path), firebaseValue => {
      log.forms('firebase value changed', field.path, firebaseValue);
      if (field.convert.toFirebase(model.$value) !== firebaseValue) {
        log.forms('setting model', field.path, model.$value, firebaseValue);
        model.$value = field.convert.toForm(firebaseValue);
        field.dirty = false;
      }
      if (!field.ready) {
        field.ready = true;
        this.$vue.$observe(() => model.$value, modelValue => {
          log.forms('model value changed', field.path, modelValue);
          modelValue = field.convert.toFirebase(modelValue);
          if (_.get(this.$root?.value, field.path) !== modelValue) {
            log.forms(
              'queuing flush', field.path, modelValue, _.get(this.$root?.value, field.path));
            field.dirty = true;
            this.$onWrite?.();
            this.$debouncedFlush();
          }
        });
      }
    });
  }
}


class Sheaf {
  private lockHeld: boolean | undefined;
  private sharedConnected = false;

  constructor(
    private readonly model: Truss.Model,
    private readonly lockRef: () => Truss.Reference | undefined,
    private newContent: boolean,
    private readonly sheets: {
      form: Form,
      sharedRef: () => Truss.Reference | undefined,
      editableRef: () => Truss.Reference | undefined
    }[]
  ) {
    for (const sheet of this.sheets) {
      this.model.$connect(sheet.editableRef);
      if (newContent) sheet.form.$bind(sheet.editableRef);
    }
    if (!newContent) this.trackLock();
  }

  get dirty() {
    return _.some(this.sheets, sheet => sheet.form.$dirty);
  }

  get editing() {
    return this.newContent || this.lockHeld;
  }

  async flush(): Promise<void> {
    await Promise.all(_.map(this.sheets, sheet => sheet.form.$flush()));
  }

  saveEdits(updates: any) {
    const lockRef = this.lockRef();
    if (!lockRef) throw new Error('Internal error: lock ref not ready');
    updates[lockRef.path] = null;
    for (const sheet of this.sheets) {
      const sharedRef = sheet.sharedRef();
      const editableRef = sheet.editableRef();
      if (!sharedRef || !editableRef) throw new Error('Internal error: content refs not ready');
      if (!editableRef.ready) throw new Error('Internal error: editable value not ready');
      updates[sharedRef.path] = editableRef.value;
    }
    if (this.newContent) {
      // Assume the update will succeed -- if it fails, that's fine, we'll just wait a bit of
      // bandwidth.
      this.newContent = false;
      this.trackLock();
    }
  }

  private trackLock() {
    log.forms('connecting form lock');
    this.model.$connect(() => this.lockRef()?.child('lock'));
    this.model.$observe(
      () => [
        this.lockRef()?.child('lock', 'userKey').ready,
        this.lockRef()?.child('lock', 'userKey').value,
        this.model.$info.userid
      ],
      ([lockUserKeyReady, lockUserKey, currentUserKey]) => {
        if (!lockUserKeyReady || currentUserKey === undefined) return;
        log.forms('lock user changed', lockUserKey, currentUserKey, this.lockHeld);
        if ((lockUserKey === currentUserKey) === this.lockHeld) return;
        this.lockHeld = lockUserKey === currentUserKey;
        if (!this.lockHeld && !this.sharedConnected) {
          // Permanently connect the original, even if we start editing, as we'll need it again
          // sooner or later and there's basically no cost to maintaining the connection.
          log.forms('connecting form lockable ref', this.lockRef);
          this.model.$connect(this.lockRef);
          this.sharedConnected = true;
        }
        for (const {form, sharedRef, editableRef} of this.sheets) {
          if (this.lockHeld) {
            form.$bind(editableRef);
          } else {
            form.$bind(sharedRef, _.once(this.copyOnWrite.bind(this)));
          }
        }
      },
      {deep: true}
    );
  }

  private async copyOnWrite() {
    if (this.newContent) throw new Error('Internal error: no need to copyOnWrite with newContent');
    const lockRef = this.lockRef();
    if (!lockRef) throw new Error('Internal error: lock ref not computable');
    const {outcome} = await lockRef.commit(txn => {
      if (txn.currentValue) {
        txn.cancel();
      } else {
        txn.set({userKey: this.model.$info.userid, timestamp: this.model.$truss.SERVER_TIMESTAMP});
      }
    });
    if (lockRef.value.userKey !== this.model.$info.userid) {
      this.resetToFirebaseValues();
      throw new Error('Somebody else beat you to editing this!');
    }
    if (outcome !== 'set') {
      this.resetToFirebaseValues();
      throw new Error('Simultaneous initial edit in another tab, please wait and try again.');
    }
    try {
      await Promise.all(_.map(this.sheets, async sheet => {
        const [sharedRef, editableRef] = await Promise.all([
          this.model.$when(sheet.sharedRef), this.model.$when(sheet.editableRef)
        ]);
        const sharedValue = await this.model.$peek(sharedRef);
        await editableRef.set(sharedValue);
      }));
      for (const sheet of this.sheets) sheet.form.$bind(sheet.editableRef);
    } catch (e) {
      this.resetToFirebaseValues();
      lockRef.set(null);
      throw e;
    }
  }

  private resetToFirebaseValues() {
    for (const {form} of this.sheets) form.$resetToFirebaseValues();
  }
}


export class Clerk {
  private readonly sheaves: Sheaf[] = [];

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private readonly model: Truss.Model) {}

  get dirty() {
    return _.some(this.sheaves, 'dirty');
  }

  get editing() {
    if (_.some(this.sheaves, sheaf => sheaf.editing === undefined)) return undefined;
    return _.some(this.sheaves, 'editing');
  }

  register(
    lockRef: () => Truss.Reference | undefined, newContent: boolean,
    contents: {
      form: Form,
      sharedRef: () => Truss.Reference | undefined,
      editableRef: () => Truss.Reference | undefined
    }[]
  ) {
    this.sheaves.push(new Sheaf(this.model, lockRef, newContent, contents));
  }

  async saveAllEdits() {
    await Promise.all(_.map(this.sheaves, sheaf => sheaf.flush()));
    if (_.some(this.sheaves, 'dirty')) {
      throw new Error('Unable to save due to invalid form values');
    }
    const updates = {};
    for (const sheaf of this.sheaves) sheaf.saveEdits(updates);
    if (_.isEmpty(updates)) return;
    await this.model.$store.$update(updates);
  }
}
