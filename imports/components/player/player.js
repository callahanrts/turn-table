import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './player.html';
import roomService from '../../services/room.js';

import { Rooms } from '../../api/rooms.js';

class PlayerCtrl {

  constructor($scope, $rootScope, roomService, $stateParams, $reactive) {
    $scope.viewModel(this);
    this.subscribe('rooms');
    let reactiveContext = $reactive(this).attach($scope);
    let $ctrl = this;
    this.size = "small";
    this.playerVars = {
      showinfo: 0,
      rel: 0,
      fs: 0,
      enablejsapi: 1,
      //controls: 0,
      autoplay: 1
    };
    let trackLastChanged = 0;

    reactiveContext.helpers({
      room: () => {
        trackLastChanged = new Date().getTime();
        let room = Rooms.findOne($stateParams.roomId);
        console.log(room)
        return  room
      }
    })

    $scope.$on('youtube.player.ended', function ($event, player) {
      Meteor.call("room.playNext", $ctrl.room._id)
    });

    $scope.$on('youtube.player.ready', function($event, player) {
      Meteor.call("room.elapsedTime", $ctrl.room._id, (err, time) => {
        if(angular.isDefined(time)) {
          let diff = (new Date().getTime() - trackLastChanged);
          player.seekTo((time / 1000) + diff / 1000);
        } else {
          console.log(err);
        }
      })
    });

  }

  djAvatar() {
    return "images/avatars/djing/" + this.room.playing.user.profile.avatar + ".gif";
  }

  upvote() {
    Meteor.call("room.upvote", this.room._id);
  }

  upvoted() {
    return this.room && this.room.playing.upvoted.indexOf(Meteor.userId()) != -1
  }

  downvote() {
    Meteor.call("room.downvote", this.room._id);
  }

  downvoted() {
    return this.room && this.room.playing.downvoted.indexOf(Meteor.userId()) != -1
  }

  skip() {
    Meteor.call("room.playNext", this.room._id)
  }

  currentlyPlaying(){
    return this.room && this.room.playing.user._id == Meteor.userId();
  }

  admin(){
    return this.room && this.room.admins.indexOf(Meteor.userId()) != -1
  }

}

PlayerCtrl.$inject = ['$scope', '$rootScope', roomService.name, '$stateParams', '$reactive'];

export default angular.module('player', [
  angularMeteor,
  roomService.name
])
  .component('player', {
    templateUrl: 'imports/components/player/player.html',
    controller: PlayerCtrl
  });
