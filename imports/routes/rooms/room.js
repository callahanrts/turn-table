import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Mongo } from 'meteor/mongo';

import template from './room.html';

import { Rooms } from '../../api/rooms.js';
import roomService from '../../services/room.js';

class RoomCtrl {

  constructor($scope, $stateParams, roomService) {
    $scope.viewModel(this);
    this.subscribe('rooms');
    let $ctrl = this;

    this.helpers({
      room() {
        $ctrl.room = Rooms.findOne($stateParams.roomId);
        return $ctrl.room;
      }
    });

    let i = setInterval(() => {
      if(!!$ctrl.room) {
        clearInterval(i);
        roomService.joinRoom($ctrl.room);
      }
    }, 100)

  }

}

RoomCtrl.$inject = ['$scope', '$stateParams', roomService.name];

export default angular.module('room', [
  angularMeteor,
  roomService.name,
])
  .component('room', {
    templateUrl: 'imports/routes/rooms/room.html',
    controller: RoomCtrl
  });
