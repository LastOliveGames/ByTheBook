import Vue from 'vue';
import Truss from 'firetruss';
import _ from 'lodash';
import {prop, collectProps, isPropPlaceholder} from './props';
import {form, collectForms, isFormPlaceholder} from './forms';

export {Vue, prop, form};


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

  if (Class.$vueOptions) _.assign(component, Class.$vueOptions);
  const instance = new Class();
  component.props = collectProps(instance);
  component.mixins.push({data: collectForms(instance)});
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
      if (!_.isFunction(descriptor.value)) {
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
  const keys = _.filter(
    Object.getOwnPropertyNames(vue),
    key => key.charAt(0) !== '_' && _.has(proto, key)
  );
  if (vue.$options.props) {
    for (const key in vue.$options.props) {
      if (!_.has(vue, key) && !_.has(proto, key)) keys.push(key);
    }
  }
  for (const key of keys) {
    Object.defineProperty(proto, key, {
      get: () => vue[key],
      set: value => {
        if (!isPropPlaceholder(value) && !isFormPlaceholder(value)) vue[key] = value;
      },
      configurable: true
    });
  }
  const instance = new Class();
  for (const key of keys) delete proto[key];
  const data = {};
  for (const key in instance) {
    const value = instance[key];
    if (_.has(instance, key) && !(
      key in vue || key === '_data' || isPropPlaceholder(value) || isFormPlaceholder(value)
    )) {
      data[key] = value;
    }
  }
  return data;
}
