import Router from 'vue-router';
import HomePage from ':views/home-page.vue';
import PlaybillPage from ':views/playbill/playbill-page.vue';
import PlayEditorPage from ':views/play-editor/play-editor-page.vue';
import NotFoundPage from ':views/not-found-page.vue';

export default new Router({
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
