import Vue from 'vue';
import Truss from 'firetruss';

const dev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

const firebaseConfig = dev ?
  {
    apiKey: 'demo-dev',
    projectId: 'demo-dev',
    appId: 'demo-dev',
    databaseUrl: 'http://demo-dev-default-rtdb.firebaseio.com',
  } : {
    apiKey: 'AIzaSyDhxbwYETvut5Zi4AjYZCpD_vUVs22Nsnw',
    authDomain: 'playwright-prod.firebaseapp.com',
    databaseUrl: 'https://playwright-prod-default-rtdb.firebaseio.com',
    projectId: 'playwright-prod',
    appId: '1:1082142850413:web:0b5d324778b2931b1dae64',
  };


const worker = new Worker(new URL('../workers/truss-worker', import.meta.url), {type: 'module'});
Truss.connectWorker(worker, firebaseConfig);
Truss.preExpose('useEmulators');
Truss.preExpose('callServerFunction');
if (dev) {
  console.log('Running in dev mode using Firebase emulators');
  Truss.worker.useEmulators();
}

const truss = new Truss(firebaseConfig.databaseUrl);
Vue.use(Truss.ComponentPlugin, {truss});
export default truss;
