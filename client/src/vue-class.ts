import Vue from 'vue';

class PropPlaceholder {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(readonly type: any, readonly defaultValue?: any, readonly validator?: any) {}
}

export function prop(type, defaultValue?, validator?): any {
  return new PropPlaceholder(type, defaultValue, validator);
}

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


const VUE_OPTIONS = {
  // Component hooks
  beforeCreate: true, created: true, beforeMount: true, mounted: true, beforeUpdate: true,
  updated: true, activated: true, deactivated: true, beforeDestroy: true, destroyed: true,
  errorCaptured: true, render: true, renderError: true, data: true,
};

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
      if (VUE_OPTIONS[name]) {
        component[name] = descriptor.value;
      } else {
        component.methods[name] = descriptor.value;
      }
    } else if (descriptor.get || descriptor.set) {
      // const getter = Truss.computedPropertyStats.wrap(prop.get, className, name);
      if (descriptor.set) {
        component.computed[name] = {get: descriptor.get, set: descriptor.set};
      } else {
        component.computed[name] = descriptor.get;
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
        type: placeholder.type || Object, default: defaultValue, validator: placeholder.validator
      };
    }
  }
  return props;
}

function collectDataFromConstructor(vue: Vue, Class: ComponentClass) {
  // Shim in properties from the actual Vue instance onto the component class we're instantiating
  // right now, so that the subclass's constructor can access them.
  const proto = Class.prototype;
  // if (!proto.$truss) {
  //   for (const prop of SHIM_TRUSS_PROPS) {
  //     Object.defineProperty(proto, prop, Object.getOwnPropertyDescriptor(Vue.prototype, prop));
  //   }
  // }
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
    if (Object.hasOwnProperty.call(instance, key) && !(instance[key] instanceof PropPlaceholder)) {
      data[key] = instance[key];
    }
  }
  return data;
}
