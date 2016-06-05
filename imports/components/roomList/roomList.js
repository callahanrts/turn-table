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

  loggedIn() {
    return !!Meteor.userId();
  }

  myRoom(room) {
    return room.owner == Meteor.userId();
  }

  removeRoom(room) {
    Meteor.call('rooms.remove', room._id)
  }

  enterRoom(room){
    this.$state.go('room', { roomId: room._id })
  }

  audience(room) {
    let audience = 0;
    if(Array.isArray(room.audience)) {
      audience = room.audience.length;
    }
    if(!!room.playing.user){ audience++; }
    return audience;
  }

  nowPlayingStyle(room) {
    if(!!room.playing.id){
      return { 'background-image': 'url(http://img.youtube.com/vi/'+ room.playing.id +'/mqdefault.jpg)' }
    }
    return {};
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
