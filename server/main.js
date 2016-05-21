import { Meteor } from 'meteor/meteor';

import '../imports/api/tasks.js';
import '../imports/api/rooms.js';
import '../imports/api/playlists.js';
import '../imports/api/youtube.js';
import '../imports/api/users.js';

Meteor.startup(() => {
  // code to run on server at startup
  Future = Npm.require('fibers/future');
});
