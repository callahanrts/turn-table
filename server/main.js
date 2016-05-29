import { Meteor } from 'meteor/meteor';

import '../imports/api/tasks.js';
import '../imports/api/rooms.js';
import '../imports/api/playlists.js';
import '../imports/api/youtube.js';
import '../imports/api/users.js';

Meteor.startup(() => {
  // code to run on server at startup
  Future = Npm.require('fibers/future');

  let gsettings = Meteor.settings.private.services.google;
  configureService("google", gsettings.api_key, gsettings.secret);

  let fbsettings = Meteor.settings.private.services.facebook;
  configureService("facebook", fbsettings.api_key, fbsettings.secret);

  let twsettings = Meteor.settings.private.services.twitter;
  configureService("twitter", twsettings.api_key, twsettings.secret);
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
