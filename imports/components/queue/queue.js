import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './queue.html';

import roomService from '../../services/room.js';

class QueueCtrl {

  constructor($scope, $rootScope, roomService) {
    $scope.viewModel(this);
    var $ctrl = this;
    this.roomService = roomService;

    this.helpers({
      user: () => { return Meteor.user() }
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

  admin() {
    let room = this.roomService.getRoom();
    return room && room.admins.indexOf(Meteor.userId()) != -1;
  }

}

QueueCtrl.$inject = ['$scope', '$rootScope', roomService.name];

export default angular.module('queue', [
  angularMeteor,
  roomService.name
])
  .component('queue', {
    templateUrl: 'imports/components/queue/queue.html',
    controller: QueueCtrl,
  });
