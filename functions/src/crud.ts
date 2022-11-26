import {https, logger} from 'firebase-functions';
import NodeFire from 'nodefire';
import ms from 'ms';
import db from './db';
import _ from 'lodash';


export const createPlay = https.onCall(async (data, context) => {
  checkAuthenticated(context);
  const userid = context.auth!.uid;
  logger.info(`User ${userid} creating play`);
  const publisherKey = data.publisherKey ?? await pickOrCreatePublisher(userid);
  const playKey = await createPlayStructure(publisherKey, userid);
  logger.info(
    `User ${userid} created play ${playKey}`, {action: 'createPlay', playKey, uid: userid});
  return playKey;
});

async function pickOrCreatePublisher(userid: string): Promise<string> {
  const publishersIndex =
    await db.child('/users/:userid/indexes/publishers/contents', {userid}).get();
  switch (_.size(publishersIndex)) {
    case 0: {
      const user = await db.child('/users/:userid/public', {userid}).get();
      const key = db.newKey();
      await db.child('/publishers/:key', {key}).set({
        public: {name: user?.name ?? null, avatarUrl: user?.avatarUrl ?? null},
        members: {[userid]: {role: 'owner'}}
      });
      return key;
    }
    case 1: {
      return _(publishersIndex).keys().head()!;
    }
    default:
      throw new https.HttpsError(
        'invalid-argument',
        'You are a member of multiple publishers; please select one to own the new play');
  }
}

async function createPlayStructure(publisherKey: string, userid: string): Promise<string> {
  const playKey = db.newKey();
  await validatePlayCreationRateLimit(userid, playKey);
  const introBeatKey = db.newKey(), scenesBeatKey = db.newKey(), outroBeatKey = db.newKey();
  const seed = _.random(2 ** 24);
  await db.child('/plays/:playKey', {playKey}).set({
    team: {[userid]: {role: 'owner'}},
    playbill: {
      core: {
        title: 'Untitled', publisherKey, thumbUrl: `https://picsum.photos/seed/${seed}/128/128`
      },
      art: {key: 'cover', imageUrl: `https://picsum.photos/seed/${seed}/512/512`},
      moods: {
        m0: {lo: 'Tense', hi: 'Relaxed'},
        m1: {lo: 'Serious', hi: 'Funny'},
        m2: {lo: 'Mysterious', hi: 'Clear'},
      }
    },
    acts: {
      [db.newKey()]: {ordinal: 1, remixes: {base: {introBeatKey, scenesBeatKey, outroBeatKey}}}
    },
    cast: {
      narrator: {name: 'Narrator', stances: {neutral: {name: 'neutral'}}},
      [db.newKey()]: {
        name: 'Hiro Protagonist', alias: 'Hiro',
        traits: {t0: 'Bravery', t1: 'Kindness', t2: 'Perception'},
        stances: {neutral: {name: 'neutral'}}
      }
    },
    beats: {
      [introBeatKey]: {name: 'Intro', kind: 'L'},
      [scenesBeatKey]: {name: 'Scenes', kind: 'C', repeating: true},
      [outroBeatKey]: {name: 'Ending', kind: 'L'}
    }
  });
  return playKey;
}

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
    throw new https.HttpsError('unauthenticated', 'Unauthenticated');
  }
}
