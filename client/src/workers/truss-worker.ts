/* eslint-disable import/no-duplicates */
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/functions';
import Fireworker from 'firetruss-worker';

(self as any).firebase = firebase;

Fireworker.expose(function useEmulators() {
  firebase.database().useEmulator('localhost', 9000);
  firebase.auth().useEmulator('http://localhost:9099');
  firebase.storage().useEmulator('localhost', 9199);
  firebase.functions().useEmulator('localhost', 5001);
}, 'useEmulators');

const functions = {};

Fireworker.expose(function callServerFunction(name: string, options: any) {
  if (!functions[name]) functions[name] = firebase.functions().httpsCallable(name);
  return functions[name](options).then(result => result.data);
}, 'callServerFunction');
