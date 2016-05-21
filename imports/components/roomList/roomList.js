import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './roomList.html';
import { Rooms } from '../../api/rooms.js';

class RoomListCtrl {

  constructor($scope, $state) {
    this.$state = $state;
    $scope.viewModel(this);
    this.subscribe('rooms');

    this.helpers({
      rooms() {
        return Rooms.find({});
      }
    })

  }

  createRoom(name) {
    Meteor.call("rooms.insert", {
      name: name
    });
  }

  removeRoom(room) {
    Meteor.call('rooms.remove', room._id)
  }

  enterRoom(room){
    this.$state.go('room', { roomId: room._id })
  }

}

RoomListCtrl.$inject = ['$scope', '$state']

export default angular.module('roomList', [
  angularMeteor,
])
  .component('roomList', {
    templateUrl: 'imports/components/roomList/roomList.html',
    controller: RoomListCtrl,
  });
