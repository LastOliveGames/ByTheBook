import _ from 'lodash';


class PropPlaceholder {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    readonly type: any, readonly defaultValue?: any, readonly required?: boolean,
    readonly validator?: any
  ) { }  // eslint-disable-line no-empty-function
}

export function prop(type, defaultValue?, required?, validator?): any {
  return new PropPlaceholder(type, defaultValue, required, validator);
}

prop.required = {
  string(defaultValue?: string): string {
    return new PropPlaceholder(String, defaultValue, true) as unknown as string;
  },
  number(defaultValue?: number): number {
    return new PropPlaceholder(Number, defaultValue, true) as unknown as number;
  },
  boolean(defaultValue?: boolean): boolean {
    return new PropPlaceholder(Boolean, defaultValue, true) as unknown as boolean;
  },
  function<T>(defaultValue?: T): T {
    return new PropPlaceholder(Function, defaultValue, true) as unknown as T;
  },
  object<T>(klass?: {new(): T}, defaultValue?: any): T {
    return new PropPlaceholder(klass ?? Object, defaultValue, true) as unknown as T;
  },
  array<T>(defaultValue?: T[]): T[] {
    return new PropPlaceholder(Array, defaultValue, true) as unknown as T[];
  },
};

prop.string = function(defaultValue?: string): string {
  return new PropPlaceholder(String, defaultValue) as unknown as string;
};
prop.number = function(defaultValue?: number): number {
  return new PropPlaceholder(Number, defaultValue) as unknown as number;
};
prop.boolean = function(defaultValue?: boolean): boolean {
  return new PropPlaceholder(Boolean, defaultValue) as unknown as boolean;
};
prop.object = function <T>(klass?: {new(): T}, defaultValue?: any): T {
  return new PropPlaceholder(klass ?? Object, defaultValue) as unknown as T;
};
prop.function = function <T>(defaultValue?: T): T {
  return new PropPlaceholder(Function, defaultValue) as unknown as T;
};
prop.array = function <T>(defaultValue?: T[]): T[] {
  return new PropPlaceholder(Array, defaultValue) as unknown as T[];
};


export function collectProps(instance: any) {
  const props = {};
  for (const key in instance) {
    const placeholder = instance[key];
    if (_.has(instance, key) && isPropPlaceholder(placeholder)) {
      let defaultValue = placeholder.defaultValue;
      // We need to clone objects and arrays used as defaults.
      if (_.isObject(defaultValue) && defaultValue !== null) {
        const originalValue = defaultValue;
        defaultValue = function() {return structuredClone(originalValue);};
      }
      props[key] = {
        type: placeholder.type || Object, default: defaultValue, validator: placeholder.validator,
        required: placeholder.required
      };
    }
  }
  return props;
}


export function isPropPlaceholder(value: any) {
  return value instanceof PropPlaceholder;
}
