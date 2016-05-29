import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Playlists } from './playlists.js';

export const Rooms = new Mongo.Collection('rooms');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish rooms that are public or belong to the current user
  Meteor.publish('rooms', function roomsPublication() {

    return Rooms.find();

  });

  Meteor.methods({
    'room.playNext' (roomId) {
      // ✓ Can be forced by admin
      // ✓ Can be done by video player
      // ✓   Tracks must be within 10s of ending to prevent abuse by non-admins
      // Conditions:
      //   If a user is not online, skip them.
      //   ✓ If a user does not have an active playlist, skip them.
      //   ✓ If the user's active playlist does not have a track, skip them.
      //   ✓ If there is no one in the queue, save empty queue and return
      playNext(roomId);
    },

    'room.elapsedTime' (roomId) {
      let room = Rooms.findOne(roomId);
      return new Date().getTime() - room.playing.started;
    },

    'room.addToQueue' (roomId, userId, position) {
      check(roomId, String);
      check(userId, String);
      let room = Rooms.findOne(roomId);
      let user = Meteor.users.findOne(userId);

      // Add user to the room's queue
      if(!!user) room.queue.push({ id: user._id, name: user.profile.name });

      // Ensure uniqueness of queue
      room.queue = _.uniq(room.queue, false, (el) => { return el.id });

      // Update the queue and play next (if no one is playing)
      if(updateQueue(room, userId)) {
        console.log("added " + userId + " to queue");
        //if(!roomIsPlaying(room)){ playNext(room._id); }
      }
    },

    'room.removeFromQueue' (roomId, userId) {
      check(roomId, String);
      check(userId, String);
      let room = Rooms.findOne(roomId);
      let user = Meteor.users.findOne(userId);

      // Remove user from queue
      // This should be locked to admins and the user him/herself
      room.queue = without(room.queue, user._id);
      if(updateQueue(room, userId)){
        console.log("removed " + userId + " from queue")
      }
    },


  })

}

var without = (array, id) => {
  return _.compact(array.map((el) => {
    return (el.id == id) || (el._id == id) ? null : el;
  }))
}

Meteor.methods({ 'rooms.insert' (room) {
    // check(text, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Rooms.insert(_.extend(room, {
      queue: [],
      admins: [Meteor.userId()],
      audience: [],
      playing: {},
      settings: defaultSettings(),
      createdAt: new Date(),
      owner: Meteor.userId(),
    }));

  },

  'rooms.remove' (roomId) {
    check(roomId, String);

    const room = Rooms.findOne(roomId);
    if (room.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Rooms.remove(roomId);
  },

  'room.join' (roomId) {
    check(roomId, String);
    let room = Rooms.findOne(roomId);
    let user = _.pick(Meteor.user(), "_id", "profile");

    // User defaults. This should be done after signup (If I can find a way to do it).
    if(!Meteor.user().profile || !Meteor.user().profile.avatar) Meteor.call("user.updateAvatar", "classic08");
    if(!Meteor.user().profile || !Meteor.user().profile.name){
      Meteor.call("user.updateName", Meteor.user().username);
    }

    // Add to audience
    if(userIsNotPlaying(room, user)){
      addUserToAudience(room, user);
    }

    // Keep track of the room a user is in
    let a = Meteor.users.update(Meteor.userId(), {$set: {"status.currentRoom": roomId }} );
    console.log((a == 1 ? "successfully joined " : "failed to join ") + roomId);
  },

  'room.updateSettings' (roomId, settings) {
    let room = Rooms.findOne(roomId);
    if(!!room && isAdmin(room.admins, Meteor.userId())){
      // Only allow specific settings to be updated
      if(settings.hasOwnProperty("requeue")){ room.settings.requeue = settings.requeue }
      if(settings.hasOwnProperty("size")){ room.settings.size = settings.size }
      if(settings.maxTrackLength){ room.settings.maxTrackLength = settings.maxTrackLength }

      Rooms.update(room._id, { $set: { settings: room.settings } });
    }
  },

  'room.upvote' (roomId) {
    let room = Rooms.findOne(roomId);
    room.playing.upvoted = _.without(room.playing.upvoted, Meteor.userId())
    room.playing.downvoted = _.without(room.playing.downvoted, Meteor.userId())
    room.playing.upvoted.push(Meteor.userId());
    Rooms.update(room._id, { $set: { playing: room.playing } });
  },

  'room.downvote' (roomId) {
    let room = Rooms.findOne(roomId);
    room.playing.upvoted = _.without(room.playing.upvoted, Meteor.userId())
    room.playing.downvoted = _.without(room.playing.downvoted, Meteor.userId())
    room.playing.downvoted.push(Meteor.userId());
    Rooms.update(room._id, { $set: { playing: room.playing } });
  },

  'room.givePrivilege' (userId, role) {
    // Admins can give privileges to users
  },

  'room.revokePrivilege' (userId) {
    // Admins can revoke privileges
  },

});

// Add up the upvotes a user got and add that to the user's score
var scoreTrack = (room) => {
  if(!room.playing.user) return
  let user = Meteor.users.findOne(room.playing.user._id);
  if(!!user && !!room.playing) {
    console.log(user.profile.name, user.profile.score, room.playing.upvoted.length)
    user.profile.score = (user.profile.score || 0) + room.playing.upvoted.length;
    Meteor.users.update(user._id, {$set: {"profile.score": user.profile.score }});
  }
}

var updatePlaying = (room, track, user) => {
  let u = _.pick(Meteor.users.findOne(user.id), '_id', 'profile');
  scoreTrack(room);
  if(room.playing && room.playing.user) {
    // Add playing user back to audience
    room.audience.push(_.pick(room.playing.user, "_id", "profile"));
  }
  Rooms.update(room._id, { $set: {
    queue: room.queue,
    audience: without(room.audience, u._id),
    playing: _.extend(track, { started: new Date().getTime(), upvoted: [], downvoted: [], user: u }) || {}
  } });
}

var nextTrack = (userId) => {
  let playlist = Playlists.findOne({ owner: userId, active: true });
  if(!!playlist) {
    let track = playlist.tracks.shift();
    if(!!track) {
      playlist.tracks.push(track); // Put track at end of playlist
      Playlists.update(playlist._id, { $set: { tracks: playlist.tracks } })
    }
    return !!track ? track : null;
  } else {
    return null;
  }
}

var nextUser = (room) => {
  if(room.queue.length > 0) {
    let u = room.queue.shift();
    // Requeue user if that's the room's settings
    if(room.settings.requeue){ room.queue.push(u) }
    return u;
  } else {
    return null;
  }
}

var playNext = (roomId) => {
  let room = Rooms.findOne(roomId);
  //if(isAdmin(room.admins, Meteor.userId()) || trackOver(room) || room.playing.user._id == Meteor.userId()) {
    let user = nextUser(room);

    // If there is no one else in the queue to play, clear playing
    if(!user){
      // Rooms.update(room._id, { $set: { playing: {} } });
      // updatePlaying(room, {});
      return
    }

    // If the next person has a track lined up, let them play it. Otherwise, skip them
    // and eject them from the queue
    let track = nextTrack(user.id);
    if(!!track){
      updatePlaying(room, track, user);
    } else {
      Rooms.update(room._id, { $set: { queue: without(room.queue, user.id) } });
      playNext(room._id);
    }
  //}
    //Rooms.update(room._id, { $set: { playing: {} } });
}

var trackOver = (room) => {
  let started = room.playing.started;
  let msDuration = moment.duration(room.playing.duration).asMilliseconds();
  let now = new Date().getTime()
  return started + msDuration < now
}

var defaultSettings = () => {
  return {
    requeue: false,
    maxTrackLength: 10,
    size: "medium",
  }
}

var isAdmin = (admins, userId) => {
  return admins.indexOf(userId) != -1
}

var addUserToAudience = (room, user) => {
  room.audience.push(user);
  room.audience = _.uniq(room.audience, false, (el) => { return el._id });
  Rooms.update(room._id, { $set: { audience: room.audience } });
}

var userIsNotPlaying = (room, user) => {
  return !!room && (!room.playing.user || room.playing.user._id != user._id);
}

var roomIsPlaying = (room) => {
  return !!room && room.playing && room.playing.user;
}

var updateQueue = (room, userId) => {
  let me = Meteor.user();
  let user = Meteor.users.findOne(userId);

  if(!!room && !!me && !!user) {
    // If the user is an admin or adding/removing oneself from the queue
    if(me._id === user._id || isAdmin(room.admins, me._id)) {
      let success = Rooms.update(room._id, { $set: { queue: room.queue } });
      if(success == 1){ return true; }
    }
  }
  return false;
}
