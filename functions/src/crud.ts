import {https, logger} from 'firebase-functions';
import NodeFire from 'nodefire';
import ms from 'ms';
import db from './db';


export const createPlay = https.onCall(async (data, context) => {
  checkAuthenticated(context);
  const userid = context.auth!.uid;
  logger.info(`User ${userid} creating play`);
  const playKey = db.newKey();
  await validatePlayCreationRateLimit(userid, playKey);
  await db.update({
    [db.child('/plays/:playKey', {playKey}).path]: {
      core: {title: 'Untitled'}, playbill: {numActs: 1}, people: {[userid]: {role: 'editor'}}
    },
    [db.child('/users/:userid/playsIndex/:playKey', {userid, playKey}).path]: {
      relation: 'editor'
    }
  });
  logger.info(
    `User ${userid} created play ${playKey}`, {action: 'createPlay', playKey, uid: userid});
  return playKey;
});

async function validatePlayCreationRateLimit(userid: string, playKey: string) {
  const rateLimitRef =
    db.child('/users/:userid/rateLimiting/playCreation', {userid});
  const now = db.now;
  let txnResult;
  do {
    const rateLimit = await rateLimitRef.get();
    if (rateLimit && now - rateLimit.lastTimestamp < ms('1d')) {
      const playCore =
        await db.child('/plays/:playKey/core', {playKey: rateLimit.lastPlayKey}).get();
      if (playCore) {
        throw new https.HttpsError(
          'failed-precondition', 'You can only create one play per day; please try again later');
      }
    }
    txnResult = await rateLimitRef.transaction(limit => {
      if (limit && now - limit.lastTimestamp < ms('1d') &&
        limit.lastPlayKey !== rateLimit?.lastPlayKey) return;
      return {lastTimestamp: NodeFire.SERVER_TIMESTAMP, lastPlayKey: playKey};
    });
  } while (!txnResult);
}


function checkAuthenticated(context: https.CallableContext) {
  if (!context.auth) {
    throw new https.HttpsError('failed-precondition', 'Unauthenticated');
  }
}
