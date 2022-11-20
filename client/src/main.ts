import Vue from 'vue';
import Vuetify from 'vuetify';
import Router from 'vue-router';
// import './style.css';
import App from './components/app.vue';
import HomePage from ':components/home-page.vue';
import PlaybillPage from ':components/playbill/playbill-page.vue';
import PlayEditorPage from ':components/play-editor/play-editor-page.vue';
import NotFoundPage from ':components/not-found-page.vue';
import truss from ':core/truss-models';

(window as any).truss = truss;

Vue.use(Vuetify);
Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {path: '/', component: HomePage},
    {path: '/plays/:titleSlug/:playKey', component: PlaybillPage, props: true},
    {path: '/plays/:titleSlug/:playKey/edit', component: PlayEditorPage, props: true},
    {path: '/:catchAll(.*)', component: NotFoundPage}
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return {x: 0, y: 0};
  }
});

new Vue({
  vuetify: new Vuetify(),
  router,
  render: h => h(App)
}).$mount('#app');
