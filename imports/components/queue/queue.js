import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './queue.html';

import roomService from '../../services/room.js';

import { Rooms } from '../../api/rooms.js';
import { Playlists } from '../../api/playlists.js';

class QueueCtrl {

  constructor($scope, $rootScope, roomService, $stateParams, $reactive) {
    $scope.viewModel(this);
    let reactiveContext = $reactive(this).attach($scope);
    var $ctrl = this;
    this.roomService = roomService;

    reactiveContext.helpers({
      user: () => { return Meteor.user() },
      hasPlaylists: () => { return Playlists.find().fetch().length > 0 },
      room: () => { return Rooms.findOne($stateParams.roomId) },
    })

  }

  queue() {
    return !!this.room ? this.room.queue : [];
  }

  enqueued() {
    return !!this.room && !!_.findWhere(this.room.queue, { id: Meteor.userId() })
  }

  joinQueue() {
    Meteor.call("room.addToQueue", this.room._id, Meteor.userId());
  }

  leaveQueue(userId) {
    Meteor.call("room.removeFromQueue", this.room._id, userId || Meteor.userId());
  }

  admin() {
    return this.room && this.room.admins.indexOf(Meteor.userId()) != -1;
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
