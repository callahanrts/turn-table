import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Rooms } from '../api/rooms.js';

class roomService {

  constructor($rootScope, $stateParams, $meteor) {
    this.rootScope = $rootScope;
    var $ctrl = this;
  }

  getRoom() {
    return this.room;
  }

  getQueue() {
    return !!this.room ? this.room.queue : [];
  }

  joinRoom(room) {
    this.room = room;
    this.rootScope.$broadcast('room-joined', { room: room });
    Meteor.call("room.join", room._id);
  }

  joinQueue() {
    Meteor.call("room.addToQueue", this.room._id, Meteor.userId());
  }

  leaveQueue(userId) {
    Meteor.call("room.removeFromQueue", this.room._id, userId || Meteor.userId());
  }

  enqueued() {
    return !!this.room && !!_.findWhere(this.room.queue, { id: Meteor.userId() })
  }

}

roomService.$inject = ['$rootScope', '$stateParams', '$meteor'];

export default angular.module('roomService', [
  angularMeteor
])
  .service('roomService', roomService);
