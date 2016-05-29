import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Playlists = new Mongo.Collection('playlists');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish playlists that are public or belong to the current user
  Meteor.publish('playlists', function playlistsPublication() {

    return Playlists.find({
      owner: this.userId
    });

  });

  Meteor.publish('all-playlists', () => {
    return Playlists.find()
  })
}

Meteor.methods({ 'playlists.insert' (playlist) {
    // check(text, String);

    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    let id = Playlists.insert(_.extend(playlist, {
      createdAt: new Date(),
      owner: Meteor.userId(),
    }));

    // Return the inserted playlist
    return Playlists.findOne(id);
  },

  'playlists.update' (playlist, options) {

    if (playlist.owner != Meteor.userId()) {
      throw new Meteor.error('not-authorized');
    }

    if(options && options.active) {
      let playlists = Playlists.find({ owner: this.userId });
      playlists.forEach(function(p){
        if(!!p.active){
          p.active = false;
          savePlaylist(p);
        }
      })

      playlist.active = true

    }

    savePlaylist(playlist);

  },

  'playlists.remove' (playlist) {
    // check(taskId, String);

    // const task = Playlists.findOne(taskId);
    if (playlist.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Playlists.remove(playlist._id);
  },

});

var savePlaylist = function(playlist) {
  Playlists.update(playlist._id, {
    $set: {
      name: playlist.name,
      description: playlist.description,
      active: !!playlist.active,
      tracks: playlist.tracks
    }
  });
}
