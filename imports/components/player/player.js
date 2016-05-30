import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './player.html';
import roomService from '../../services/room.js';

import { Rooms } from '../../api/rooms.js';

const MAX_AVATAR_HEIGHT=120;
const MIN_AVATAR_HEIGHT=40;
const MAX_Y_POS=40;
const MAX_WIDTH=450;

class PlayerCtrl {

  constructor($scope, $rootScope, roomService, $stateParams, $reactive) {
    $scope.viewModel(this);
    this.subscribe('rooms');
    Meteor.subscribe('users', $stateParams.roomId);
    let reactiveContext = $reactive(this).attach($scope);
    let $ctrl = this;
    this.size = "small";
    this.positions = [];
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
        console.log(room);
        return  room
      },

      audience: () => {
        let audience = Meteor.users.find().fetch();
        this.placeAvatars(audience);
        return audience;
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

  upvoted(userId) {
    return this.room && this.room.playing.upvoted && this.room.playing.upvoted.indexOf(userId || Meteor.userId()) != -1
  }

  downvote() {
    Meteor.call("room.downvote", this.room._id);
  }

  downvoted() {
    return this.room && this.room.playing.downvoted.indexOf(Meteor.userId()) != -1
  }

  grab() {
    Meteor.call("room.grab", this.room._id);
    this.upvote();
  }

  grabbed() {
    return this.room && this.room.playing.grabbed && this.room.playing.grabbed.indexOf(userId || Meteor.userId()) != -1
  }

  skip() {
    Meteor.call("room.playNext", this.room._id)
  }

  currentlyPlaying(){
    return this.playing() && this.room.playing.user._id == Meteor.userId();
  }

  playing(userId) {
    // Someone is playing
    let playing = this.room && this.room.playing.user;

    // User is playing
    if(!!userId){
      playing = playing && this.room.playing.user._id == userId
    }

    return playing;
  }

  admin(){
    return this.room && this.room.admins.indexOf(Meteor.userId()) != -1
  }

  placeAvatars(roomAudience) {
    _.each(roomAudience, (user) => {
      let found = _.findWhere(this.positions, { _id: user._id });
      if(!found) { this.position(user._id); }
    });

    setTimeout(() => {
      _.each(this.positions, (pos) => {
        $("."+pos._id).css(pos.css);
      })
    }, 0)

  }

  position(userId) {
    let r = parseInt(Math.random() * MAX_Y_POS);
    let height = MIN_AVATAR_HEIGHT + (r / MAX_Y_POS) * (MAX_AVATAR_HEIGHT - MIN_AVATAR_HEIGHT);
    let left = parseInt(Math.random() * MAX_WIDTH);
    let css = {
      "top": r,
      "height": height,
      "left": left,
      "z-index": r + 1,
      "visibility": "visible"
    };
    this.positions.push({ _id: userId, css: css })
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
