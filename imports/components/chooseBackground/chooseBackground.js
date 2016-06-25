import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './chooseBackground.html';

import { Rooms } from '../../api/rooms.js';

class ChooseBackgroundCtrl {

  constructor($scope, $stateParams, $reactive) {
    $scope.viewModel(this);
    this.subscribe('rooms');
    this.themeIndex = 0;
    this.backgrounds = [
      '1.jpg', '2.jpg', '3.png', '4.png', '5.jpg', '6.jpg', '7.png', '8.png', '9.png',
      '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png',
      '18.jpg', '19.jpg', '20.jpg', '21.jpg', '22.jpg', '23.jpg', '24.jpg',
      '25.jpg', '26.jpg', '27.jpg', '28.png', '29.png', '30.jpg', '31.jpg'
    ]

    let reactiveContext = $reactive(this).attach($scope);
    reactiveContext.helpers({
      room: () => { return Rooms.findOne($stateParams.roomId) }
    })
  }

  close() {
    $("#backgrounds").fadeOut(200);
    $("#content-wrapper").fadeIn(200);
  }

  myBackground(bg) {
    return !!this.room && this.room.settings.background.indexOf(bg) != -1;
  }

  selectBackground(bg) {
    this.room.settings.background = "https://s3-us-west-1.amazonaws.com/plugdj-avatars/backgrounds/" + bg;
    Meteor.call('room.updateSettings', this.room._id, this.room.settings);
  }

}

ChooseBackgroundCtrl.$inject = ['$scope', '$stateParams', '$reactive'];

export default angular.module('chooseBackground', [
  angularMeteor,
])
  .component('chooseBackground', {
    templateUrl: 'imports/components/chooseBackground/chooseBackground.html',
    controller: ChooseBackgroundCtrl,
  });
