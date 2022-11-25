import Router from 'vue-router';
import HomePage from ':components/home-page.vue';
import PlaybillPage from ':components/playbill/playbill-page.vue';
import PlayEditorPage from ':components/play-editor/play-editor-page.vue';
import NotFoundPage from ':components/not-found-page.vue';

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
