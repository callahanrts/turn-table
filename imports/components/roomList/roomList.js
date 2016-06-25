import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './roomList.html';
import { Rooms } from '../../api/rooms.js';

class RoomListCtrl {

  constructor($scope, $state) {
    this.$state = $state;
    $scope.viewModel(this);
    this.subscribe('rooms');
    // set Session variable in method callback
    Meteor.call('room.getRooms', function(error, result){
      console.log(result, error)
      Session.set('rooms', result);
    });
    this.helpers({
      rooms() {
        return Session.get('rooms');
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
    return room.audience_count || 0;
  }

  nowPlayingStyle(room) {
    if(!!room.playing.id){
      return { 'background-image': 'url(' + room.playing.image + ')' }
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
