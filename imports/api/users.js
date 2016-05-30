import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Rooms } from './rooms.js';

if (Meteor.isServer) {
  // Meteor.publish('users', function tasksPublication() {
  //   return Meteor.users.find({}, {
  //     fields: {
  //       'status': 1
  //     }
  //   });
  // });

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
      }, 5000);
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

