import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Rooms } from './rooms.js';

if (Meteor.isServer) {
  Meteor.publish('users', function tasksPublication(roomId) {
    return Meteor.users.find({ 'status.currentRoom': roomId }, {
      fields: {
        status: 1,
        profile: 1
      }
    })
  });

  // Support for playing D&D: Roll 3d6 for dexterity
  Accounts.onCreateUser(function(options, user) {
    let rand = parseInt(Math.random() * 15 + 1);
    rand = rand < 10 ? "0"+rand : rand.toString();
    user.profile = user.profile || {};
    user.profile.avatar = user.profile.avatar || "base" + rand;
    user.profile.name = user.profile.name || serviceName(user.services) || user.username;
    return user;
  });

  var serviceName = (services) => {
    if(services.hasOwnProperty('facebook'))
      return services.facebook.first_name;
    else if(services.hasOwnProperty('google'))
      return services.google.given_name;
    else if(services.hasOwnProperty('twitter'))
      return services.twitter.screenName;
    return null;
  }

  // This code only runs on the server
  Meteor.users.find({ "status.online": true }).observe({
    added: function(user) {
      // user just came online
      console.log(user._id + ' signed on');
    },
    removed: function(user) {
      // id just went offline
      console.log(user._id + ' signed off');
      Meteor.call("user.checkLogout", user._id);
    }
  });

  var without = (array, id) => {
    return _.compact(array.map((el) => {
      return el.id == id || el._id == id ? null : el;
    }))
  }

  // Server methods
  Meteor.methods({
    'user.checkLogout' (userId) {
      let user = Meteor.users.findOne(userId);
      let roomId = user.status.currentRoom;
      let room = Rooms.findOne(roomId);

      // Clear the user's current room
      Meteor.users.update(user._id, {
        $set: { 'status.currentRoom': null }
      })

      // Remove the user from the queue if they've been logged out for more than a minute.
      // This allows users to stay in the queue during page refreshes, accidental navigation
      // changes, etc.
      Meteor.setTimeout(() => {
        let u = Meteor.users.findOne(user._id);
        if(!u.status.online || (!!room && u.status.currentRoom != room._id)){
          if(!!room){
            Rooms.update(room._id, {
              $set: {
                queue: without(room.queue, user._id),
                audience: without(room.audience, user._id)
              }
            });
            console.log("removing " + user._id)
          }
        }
      }, 30 * 1000);
    },

    'user.audienceOf' (roomId) {
      console.log("audience of " + roomId)
      return Meteor.users.find({ 'status.currentRoom': roomId }).fetch();
    }

  })

}

// Client methods
Meteor.methods({
  'user.updateAvatar' (avatar) {
    Meteor.users.update(Meteor.userId(), {$set: {"profile.avatar": avatar}});
  },

  'user.updateName' (name) {
    Meteor.users.update(Meteor.userId(), {$set: {"profile.name": name}})
  }

});

