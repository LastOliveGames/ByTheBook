import * as admin from 'firebase-admin';
import {logger} from 'firebase-functions';
import NodeFire from 'nodefire';


NodeFire.setCacheSize(10000);
NodeFire.setCacheSizeForDisconnectedApp(500);
const app = admin.initializeApp({
  databaseURL: process.env.FUNCTIONS_EMULATOR ?
    'http://localhost:9000/?ns=demo-dev-default-rtdb' :
    'https://playwright-prod-default-rtdb.firebaseio.com'
});
app.options.databaseAuthVariableOverride = {uid: 'server'};
const db = new NodeFire(admin.database().ref());

let connected;
db.child('.info/connected').on('value', snap => {
  connected = snap.val();
  logger.info(`Firebase ${db.toString()} ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
});

export default db;
