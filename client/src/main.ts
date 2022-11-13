import Vue from 'vue';
import Vuetify from 'vuetify';
import './style.css';
import App from './App.vue';
import ':core/truss-models';  // eslint-disable-line import/no-unresolved

Vue.use(Vuetify);

new Vue({
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app');
