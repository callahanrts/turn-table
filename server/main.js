import { Meteor } from 'meteor/meteor';

import '../imports/api/tasks.js';
import '../imports/api/rooms.js';
import '../imports/api/playlists.js';
import '../imports/api/youtube.js';
import '../imports/api/users.js';

// const GOOGLE_API_KEY      = process.env.GOOGLE_API_KEY
// const GOOGLE_APP_SECRET   = process.env.GOOGLE_APP_SECRET
// const FACEBOOK_APP_ID     = process.env.FACEBOOK_APP_ID
// const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
// const TWITTER_API_KEY     = process.env.TWITTER_API_KEY
// const TWITTER_APP_SECRET  = process.env.TWITTER_APP_SECRET

Meteor.startup(() => {
  // code to run on server at startup
  Future = Npm.require('fibers/future');

  if(!!Meteor.settings) {
    let gsettings = Meteor.settings.private.services.google;
    configureService("google", gsettings.api_key, gsettings.secret);

    let fbsettings = Meteor.settings.private.services.facebook;
    configureService("facebook", fbsettings.api_key, fbsettings.secret);

    let twsettings = Meteor.settings.private.services.twitter;
    configureService("twitter", twsettings.api_key, twsettings.secret);
  }

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
