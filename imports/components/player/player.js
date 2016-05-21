import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './player.html';
import roomService from '../../services/room.js';

import { Rooms } from '../../api/rooms.js';

class PlayerCtrl {

  // https://www.youtube.com/watch?v=AfEpGGErzpM
  constructor($scope, $rootScope, roomService, $stateParams, $reactive) {
    $scope.viewModel(this);
    let reactiveContext = $reactive(this).attach($scope);
    let $ctrl = this;
    this.size = "medium";
    this.room = {};
    this.playerVars = {
      //controls: 0,
      autoplay: 1
    };

    reactiveContext.helpers({
      room: () => { return Rooms.findOne($stateParams.roomId) }
    })

    $scope.$on('youtube.player.ended', function ($event, player) {
      Meteor.call("room.playNext", $ctrl.room._id)
    });

    $scope.$on('youtube.player.ready', function($event, player) {
      let d = new Date().getTime()//try moving this to track-changed
      Meteor.call("room.elapsedTime", $ctrl.room._id, (err, time) => {
        if(angular.isDefined(time)) {
          let diff = (new Date().getTime() - d) / 1000;
          player.seekTo((time / 1000) + (new Date().getTime() - d) / 1000);
        } else {
          console.log(err);
        }
      })
    });

  }

  changeSize(size) {
    this.size = size;
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
