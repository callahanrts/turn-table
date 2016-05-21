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
  let logoutTimeout = null
  Meteor.users.find({ "status.online": true }).observe({
    added: function(user) {
      // user just came online
      console.log(user._id + ' signed on');
      clearTimeout(logoutTimeout);
    },
    removed: function(user) {
      // id just went offline
      console.log(user._id + ' signed off');
      // Remove the user from the queue if they've been logged out for more than a minute.
      // This allows users to stay in the queue during page refreshes, accidental navigation
      // changes, etc.
      logoutTimeout = Meteor.setTimeout(() => {
        let roomId = user.status.currentRoom;
        let room = null;
        if(!!roomId){ room = Rooms.findOne(roomId) }
        if(!!room){
          Rooms.update(room._id, { $set: { queue: without(room.queue, user._id) } });
          console.log("removing " + user._id)
        }
      }, 60 * 1000);
    }
  });

  var without = (array, id) => {
    return _.compact(array.map((el) => {
      return el.id == id ? null : el;
    }))
  }

}
