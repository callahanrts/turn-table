import { Meteor } from 'meteor/meteor';

import '../imports/api/tasks.js';
import '../imports/api/rooms.js';
import '../imports/api/playlists.js';
import '../imports/api/youtube.js';
import '../imports/api/users.js';

Meteor.startup(() => {
  // code to run on server at startup
  Future = Npm.require('fibers/future');

  const GOOGLE_API_KEY      = process.env.GOOGLE_API_KEY
  const GOOGLE_APP_SECRET   = process.env.GOOGLE_APP_SECRET
  const FACEBOOK_APP_ID     = process.env.FACEBOOK_APP_ID
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
  const TWITTER_API_KEY     = process.env.TWITTER_API_KEY
  const TWITTER_APP_SECRET  = process.env.TWITTER_APP_SECRET

  configureService("google", GOOGLE_API_KEY, GOOGLE_APP_SECRET);
  configureService("facebook", FACEBOOK_APP_ID, FACEBOOK_APP_SECRET);
  configureService("twitter", TWITTER_API_KEY, TWITTER_APP_SECRET);
});

var configureService = (service, clientId, secret) => {
  ServiceConfiguration.configurations.upsert(
    { service: service},
    {
      $set: {
        clientId: clientId,
        appId: clientId,
        consumerKey: clientId,
        loginStyle: "popup",
        secret: secret
      }
    }
  );
}
