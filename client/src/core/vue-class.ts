import Vue from 'vue';
import Truss from 'firetruss';

export {Vue};

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
  object <T>(klass?: {new(): T}, defaultValue?: any): T {
    return new PropPlaceholder(klass ?? Object, defaultValue, true) as unknown as T;
  },
  array <T>(defaultValue?: T[]): T[] {
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
prop.object = function<T>(klass?: {new(): T}, defaultValue?: any): T {
  return new PropPlaceholder(klass ?? Object, defaultValue) as unknown as T;
};
prop.array = function<T>(defaultValue?: T[]): T[] {
  return new PropPlaceholder(Array, defaultValue) as unknown as T[];
};


const VUE_OPTIONS = new Set([
  // Component hooks
  'beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate',
  'updated', 'activated', 'deactivated', 'beforeDestroy', 'destroyed',
  'errorCaptured', 'render', 'renderError', 'data',
  // Vue Router hooks
  'beforeRouteEnter', 'beforeRouteUpdate', 'beforeRouteLeave'
]);

const SHIM_TRUSS_PROPS = ['$truss', '$info', '$store', '$now', '$newKey'];

type ComponentClass = {new(): any, $vueOptions?: Record<string, any>};


export function defineComponent(Class: ComponentClass, className: string, superComponent?: Vue) {
  const component: any = {
    computed: {},
    methods: {},
    mixins: []
  };

  if (Class.$vueOptions) Object.assign(component, Class.$vueOptions);
  component.props = collectPropsFromConstructor(Class);
  component.mixins.push({data(vue: Vue) {return collectDataFromConstructor(vue, Class);}});
  if (superComponent) component.extends = superComponent;
  transferProperties(Class, className, component);
  return component;
}

function transferProperties(Class: ComponentClass, className: string, component: any) {
  const descriptors = Object.getOwnPropertyDescriptors(Class.prototype);
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (name === 'constructor') continue;
    if (descriptor.value) {
      if (typeof descriptor.value !== 'function') {
        throw new Error(`${className}.${name} is not a function`);
      }
      if (VUE_OPTIONS.has(name)) {
        component[name] = descriptor.value;
      } else {
        component.methods[name] = descriptor.value;
      }
    } else if (descriptor.get || descriptor.set) {
      const get = Truss.computedPropertyStats.wrap(descriptor.get!, className, name);
      if (descriptor.set) {
        component.computed[name] = {get, set: descriptor.set};
      } else {
        component.computed[name] = get;
      }
    }
  }
}

function collectPropsFromConstructor(Class: ComponentClass) {
  const props = {};
  const instance = new Class();
  for (const key in instance) {
    const placeholder = instance[key];
    if (Object.hasOwnProperty.call(instance, key) && placeholder instanceof PropPlaceholder) {
      let defaultValue = placeholder.defaultValue;
      // We need to clone objects and arrays used as defaults.
      if (typeof defaultValue === 'object' && defaultValue !== null) {
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

function collectDataFromConstructor(vue: Vue, Class: ComponentClass) {
  // Shim in properties from the actual Vue instance onto the component class we're instantiating
  // right now, so that the subclass's constructor can access them.
  const proto = Class.prototype;
  if (!proto.$truss) {
    for (const propName of SHIM_TRUSS_PROPS) {
      const descriptor = Object.getOwnPropertyDescriptor(Vue.prototype, propName)!;
      Object.defineProperty(proto, propName, descriptor);
    }
  }
  const keys = Object.getOwnPropertyNames(vue).filter(
    key => key.charAt(0) !== '_' && Object.hasOwnProperty.call(proto, key)
  );
  if (vue.$options.props) {
    for (const key in vue.$options.props) {
      if (!Object.hasOwnProperty.call(vue, key) && !Object.hasOwnProperty.call(proto, key)) {
        keys.push(key);
      }
    }
  }
  for (const key of keys) {
    Object.defineProperty(proto, key, {
      get: () => vue[key],
      set: value => {
        if (!(value instanceof PropPlaceholder)) vue[key] = value;
      },
      configurable: true
    });
  }
  const instance = new Class();
  for (const key of keys) delete proto[key];
  const data = {};
  for (const key in instance) {
    if (Object.hasOwnProperty.call(instance, key) && !(
      key in vue || key === '_data' || instance[key] instanceof PropPlaceholder
    )) {
      data[key] = instance[key];
    }
  }
  return data;
}
