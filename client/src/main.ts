import Vue from 'vue';
import Vuetify from 'vuetify';
import Router from 'vue-router';
// import './style.css';
import App from './components/app.vue';
import truss from ':core/truss-models';
import router from ':core/router';

// TODO: figure out error handling and exception capture (Crashlytics? Sentry?)
// Remember to ignore errors with the message 'Canceled'.

(window as any).truss = truss;

Vue.use(Vuetify);
Vue.use(Router);

new Vue({
  vuetify: new Vuetify(),
  router,
  render: h => h(App)
}).$mount('#app');
