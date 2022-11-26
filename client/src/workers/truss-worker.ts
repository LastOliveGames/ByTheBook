/* eslint-disable import/no-duplicates */
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/functions';
import Fireworker from 'firetruss-worker';

(self as any).firebase = firebase;

let app: ReturnType<typeof firebase.app>;

Fireworker.expose(function selectApp(databaseURL) {
  app = firebase.app(databaseURL); // eslint-disable-line import/no-named-as-default-member
}, 'selectApp');

Fireworker.expose(function useEmulators(databaseURL) {
  app.database().useEmulator('localhost', 9000);
  app.auth().useEmulator('http://localhost:9099');
  app.storage().useEmulator('localhost', 9199);
  app.functions().useEmulator('localhost', 5001);
}, 'useEmulators');

const functions = {};

Fireworker.expose(function callServerFunction(name: string, options: any) {
  if (!functions[name]) functions[name] = app.functions().httpsCallable(name);
  return functions[name](options).then(result => result.data);
}, 'callServerFunction');
