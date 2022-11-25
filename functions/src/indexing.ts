import {database} from 'firebase-functions';
import _ from 'lodash';
import NodeFire from 'nodefire';
import db from './db';

export const addPublisherMember =
  database.ref('/publishers/{publisherKey}/members/{userKey}').onCreate(async (snap, context) => {
    await db.child('/users/:userKey/indexes/publishers', context.params).update({
      'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
      [`contents/${context.params.publisherKey}/member`]: true
    });
  });

export const removePublisherMember =
  database.ref('/publishers/{publisherKey}/members/{userKey}').onDelete(async (snap, context) => {
    await db.child('/users/:userKey/indexes/publishers', context.params).update({
      'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
      [`contents/${context.params.publisherKey}/member`]: null
    });
  });

export const updatePlayTeam =
  database.ref('/plays/{playKey}/team/{userKey}/role').onWrite(async (change, context) => {
    if (change.after.exists()) {
      await db.child('/users/:userKey/indexes/plays', context.params).update({
        'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
        [`contents/${context.params.playKey}/maker`]: change.after.val()
      });
    } else if (change.before.exists()) {
      await db.child('/users/:userKey/indexes/plays', context.params).update({
        'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
        [`contents/${context.params.playKey}/maker`]: null
      });
    }
  });

export const setPlayPublisher =
  database.ref('/plays/{playKey}/playbill/core/publisherKey').onWrite(async (change, context) => {
    const userKeysRemoved: string[] = [], userKeysAdded: string[] = [];
    if (change.before.exists()) {
      const oldPublisherKey = change.before.val();
      const oldMembers =
        await db.child('/publishers/:oldPublisherKey/members', {oldPublisherKey}).get();
      userKeysRemoved.push(..._.keys(oldMembers));
    }
    if (change.after.exists()) {
      const newPublisherKey = change.after.val();
      const newMembers =
        await db.child('/publishers/:newPublisherKey/members', {newPublisherKey}).get();
      _.forEach(newMembers, (unused, userKey) => {
        if (_.includes(userKeysRemoved, userKey)) {
          _.pull(userKeysRemoved, userKey);
        } else {
          userKeysAdded.push(userKey);
        }
      });
    }
    await Promise.all(_.concat(
      _.map(userKeysRemoved, userKey =>
        db.child('/users/:userKey/indexes/plays', {userKey}).update({
          'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
          [`contents/${context.params.playKey}/publisher`]: null
        })
      ),
      _.map(userKeysAdded, userKey =>
        db.child('/users/:userKey/indexes/plays', {userKey}).update({
          'lastUpdateTimestamp': NodeFire.SERVER_TIMESTAMP,
          [`contents/${context.params.playKey}/publisher`]: true
        })
      ),
    ));
  });

// If a play was hidden but loses all its index flags, then remove it from the index altogether.
export const deindexPlay =
  database.ref('/users/{userKey}/indexes/plays/contents/{playKey}')
  .onUpdate(async (change, context) => {
    const entry = change.after.val();
    if (!entry.writer && !entry.publisher && !entry.player) {
      await change.after.ref.remove();
    }
  });
