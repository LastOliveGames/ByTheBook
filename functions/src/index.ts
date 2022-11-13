import * as functions from 'firebase-functions';

export const toUpperCase = functions.https.onCall((data, context) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  return data.text?.toUpperCase();
});
