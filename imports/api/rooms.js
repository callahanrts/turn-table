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
      if(!!user) room.queue.push({ id: user._id, name: user.profile.name });
      room.queue = _.uniq(room.queue, false, (el) => { return el.id });
      if(updateQueue(room, userId))
        console.log("added " + userId + " to queue");
    },

    'room.removeFromQueue' (roomId, userId) {
      check(roomId, String);
      check(userId, String);
      let room = Rooms.findOne(roomId);
      let user = Meteor.users.findOne(userId);
      room.queue = without(room.queue, user._id);
      if(updateQueue(room, userId))
        console.log("removed " + userId + " from queue")
    },


  })

}

var without = (array, id) => {
  return _.compact(array.map((el) => {
    return el.id == id ? null : el;
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
    }

    Rooms.remove(roomId);
  },

  'room.join' (roomId) {
    check(roomId, String);
    let a = Meteor.users.update(Meteor.userId(), {$set: {"status.currentRoom": roomId }} );
    console.log((a == 1 ? "successfully joined " : "failed to join ") + roomId);
  },

  'room.updateSettings' (roomId, settings) {
    let room = Rooms.findOne(roomId);
    if(!room){ return }
    if(isAdmin(room.admins, Meteor.userId())){
      if(settings.requeue){ room.settings.requeue = settings.requeue }
      if(settings.maxTrackLength){ room.settings.maxTrackLength = settings.maxTrackLength }
      Rooms.update(room._id, { $set: { settings: room.settings } })
    }
  },

  'room.givePrivilege' (userId, role) {
    // Admins can give privileges to users
  },

  'room.revokePrivilege' (userId) {
    // Admins can revoke privileges
  },

});

var updatePlaying = (room, track) => {
  Rooms.update(room._id, { $set: {
    queue: room.queue,
    playing: _.extend(track, { started: new Date().getTime() }) || {}
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
  if(isAdmin(room.admins, Meteor.userId()) || trackOver(room)) {
    let user = nextUser(room);
    if(user == null){ return }

    let track = nextTrack(user.id);
    if(!!track){
      updatePlaying(room, track);
    } else {
      Rooms.update(room._id, { $set: { queue: without(room.queue, user.id) } });
      playNext(room._id);
    }
  }
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
  }
}

var isAdmin = (admins, userId) => {
  return admins.indexOf(userId) != -1
}

var updateQueue = (room, userId) => {
  let me = Meteor.users.findOne(Meteor.userId());
  let user = Meteor.users.findOne(userId);
  if(room != undefined && me != undefined && user != undefined) {
    if(me._id === user._id || isAdmin(room.admins, me._id)) {
      let success = Rooms.update(room._id, { $set: { queue: room.queue } });
      if(success == 1)
        return true;
    }
  }
  return false;
}
