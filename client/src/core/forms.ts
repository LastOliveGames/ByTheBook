import _ from 'lodash';
import {Converter, Field, Form} from '../helpers/clerk';

type Validator<T> = ((this: Form, value: T) => boolean | string);
type ToValueAndRules<T> = T extends object ?
  PropertiesToValueAndRules<T> : {$value: T, $rules: Validator<T>[]};

type PropertiesToValueAndRules<T> = {
  [K in keyof T]: ToValueAndRules<T[K]>;
};

const identityConverter = {
  toForm: _.identity,
  toFirebase: _.identity
};

const integerConverter = {
  toForm: _.identity,
  toFirebase: _.parseInt
};


class FormPlaceholder<T> {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly struct: T) { }
}

class BoundField<T> {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    readonly converter: Converter,
    readonly validators?: ((value: T) => boolean | string)[]
  ) { }  // eslint-disable-line no-empty-function
}

const requiredValidator =
  function(this: Form, value: any) {return _.isNil(value) ? 'Required.' : true;};

export function form<T>(struct: T): PropertiesToValueAndRules<T> & Form {
  return new FormPlaceholder(struct) as unknown as PropertiesToValueAndRules<T> & Form;
}

form.required = _.assign(
  function(options: {togetherWith?: string[]}) {
    const validators: Validator<any>[] = [];
    if (options.togetherWith) {
      validators.push(function(this: Form, value: any) {
        if (_.isNil(value) && _.some(options.togetherWith, path => !_.isNil(_.get(this, path)))) {
          return 'Required.';
        }
        return true;
      });
    } else {
      validators.push(requiredValidator);
    }
    return {
      string(): string {
        return new BoundField(identityConverter, validators) as unknown as string;
      },
      integer(): number {
        return new BoundField(integerConverter, validators) as unknown as number;
      }
    };
  },
  {
    string(): string {
      return new BoundField(identityConverter, [requiredValidator]) as unknown as string;
    },
    integer(): number {
      return new BoundField(integerConverter, [requiredValidator]) as unknown as number;
    }
  }
);

form.string = function(): string {
  return new BoundField(identityConverter) as unknown as string;
};

form.integer = function(): number {
  return new BoundField(integerConverter) as unknown as number;
};


type Spec = {skeleton: any, fields: Field[]};

export function collectForms(instance: any): (vue: Vue) => any {
  const forms: {[key: string]: Spec} = {};
  for (const key in instance) {
    const placeholder = instance[key];
    if (_.has(instance, key) && isFormPlaceholder(placeholder)) {
      const spec: Spec = {skeleton: {}, fields: []};
      extractSpec(placeholder.struct, [], spec);
      forms[key] = spec;
    }
  }
  return function(vue: Vue) {
    return _.mapValues(forms, spec => new Form(vue, spec));
  };
}

function extractSpec(struct: any, path: string[], spec: Spec) {
  for (const key in struct) {
    if (!_.has(struct, key)) continue;
    if (_.startsWith(key, '$')) throw new Error(`Invalid key in form: ${key}`);
    const value = struct[key];
    const childPath = [...path, key];
    if (value instanceof BoundField) {
      _.set(spec.skeleton, childPath, {$value: undefined, $rules: value.validators ?? []});
      spec.fields.push({path: childPath, convert: value.converter, ready: false, dirty: false});
    } else if (_.isPlainObject(value)) {
      extractSpec(value, childPath, spec);
    } else {
      throw new Error(`Invalid value found in form: ${value}`);
    }
  }
}

export function isFormPlaceholder(value: any) {
  return value instanceof FormPlaceholder;
}
