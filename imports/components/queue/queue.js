import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './queue.html';

import roomService from '../../services/room.js';

import { Rooms } from '../../api/rooms.js';

class QueueCtrl {

  constructor($scope, $rootScope, roomService, $stateParams, $reactive) {
    $scope.viewModel(this);
    let reactiveContext = $reactive(this).attach($scope);
    var $ctrl = this;
    this.roomService = roomService;

    reactiveContext.helpers({
      user: () => { return Meteor.user() },
      room: () => { return Rooms.findOne($stateParams.roomId) }
    })

  }

  queue() {
    return this.roomService.getQueue();
  }

  enqueued() {
    return this.roomService.enqueued()
  }

  joinQueue() {
    this.roomService.joinQueue()
  }

  leaveQueue(userId) {
    this.roomService.leaveQueue(userId)
  }

  skip() {
    Meteor.call("room.playNext", this.room._id)
  }

  admin() {
    let room = this.roomService.getRoom();
    return room && room.admins.indexOf(Meteor.userId()) != -1;
  }

}

QueueCtrl.$inject = ['$scope', '$rootScope', roomService.name, '$stateParams', '$reactive'];

export default angular.module('queue', [
  angularMeteor,
  roomService.name
])
  .component('queue', {
    templateUrl: 'imports/components/queue/queue.html',
    controller: QueueCtrl,
  });
