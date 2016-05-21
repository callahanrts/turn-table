import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

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
    added: function(id) {
      console.log(id + ' signed on');
      // id just came online
    },
    removed: function(id) {
      console.log(id + ' signed off');
      // id just went offline
    }
  });
}
