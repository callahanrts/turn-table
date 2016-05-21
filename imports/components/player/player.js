import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './player.html';
import roomService from '../../services/room.js';

class PlayerCtrl {

  // https://www.youtube.com/watch?v=AfEpGGErzpM
  constructor($scope, $rootScope, roomService) {
    $scope.viewModel(this);
    let $ctrl = this;
    this.size = "medium";
    this.room = {};
    this.playerVars = {
      //controls: 0,
      autoplay: 1
    };

    $scope.$on('youtube.player.ended', function ($event, player) {
      Meteor.call("room.playNext", $ctrl.room._id)
    });

    $scope.$on('youtube.player.ready', function($event, player) {
      Meteor.call("room.elapsedTime", $ctrl.room._id, (err, time) => {
        if(angular.isDefined(time)) {
          player.seekTo(time / 1000)
        } else {
          console.log(err);
        }
      })
    });

    $rootScope.$on('track-changed', (event, args) => {
      $ctrl.room = args.room || {};
    })

  }

  changeSize(size) {
    this.size = size;
  }

}

PlayerCtrl.$inject = ['$scope', '$rootScope', roomService.name];

export default angular.module('player', [
  angularMeteor,
  roomService.name
])
  .component('player', {
    templateUrl: 'imports/components/player/player.html',
    controller: PlayerCtrl
  });
