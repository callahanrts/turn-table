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
    this.size = "medium";
    this.playerVars = {
      //controls: 0,
      autoplay: 1
    };
    let trackLastChanged = 0;

    reactiveContext.helpers({
      room: () => {
        trackLastChanged = new Date().getTime();
        return Rooms.findOne($stateParams.roomId);
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
