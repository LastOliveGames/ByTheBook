import * as admin from 'firebase-admin';
import {logger} from 'firebase-functions';
import NodeFire from 'nodefire';


NodeFire.setCacheSize(10000);
NodeFire.setCacheSizeForDisconnectedApp(500);
const app = admin.initializeApp();
app.options.databaseAuthVariableOverride = {uid: 'server'};
const db = new NodeFire(admin.database().ref());

let connected;
db.child('.info/connected').on('value', snap => {
  connected = snap.val();
  logger.info(`Firebase ${db.toString()} ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
});

export default db;
