import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

// Components
import player from         '../imports/components/player/player';
import cpanel from         '../imports/components/controlPanel/controlPanel';
import playlists from      '../imports/components/playlists/playlists';
import queue from          '../imports/components/queue/queue';
import playlistEditor from '../imports/components/playlistEditor/playlistEditor';
import chooseAvatar from   '../imports/components/chooseAvatar/chooseAvatar';
import chooseBackground from '../imports/components/chooseBackground/chooseBackground';
import roomList from       '../imports/components/roomList/roomList';
import mainMenu from       '../imports/components/mainMenu/mainMenu';

// Routes
import room from '../imports/routes/rooms/room';
import rooms from '../imports/routes/rooms/list';

import { Rooms } from '../imports/api/rooms.js';

import '../imports/startup/accounts-config.js';

import ytembed  from 'angular-youtube-embed';
import sortable from 'angular-ui-sortable';

angular.module('turn-table', [
  angularMeteor,
  uiRouter,

  ytembed,

  player.name,
  cpanel.name,
  playlists.name,
  playlistEditor.name,
  chooseAvatar.name,
  chooseBackground.name,
  roomList.name,
  queue.name,
  mainMenu.name,

  room.name,
  rooms.name,

  'accounts.ui',
  'ui.sortable',
])
  .config(['$locationProvider', '$urlRouterProvider', '$stateProvider', ($locationProvider, $urlRouterProvider, $stateProvider) => {
    'ngInject';

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('rooms', {
        url: '/',
        template: '<rooms></rooms>'
      })
      .state('room', {
        url: '/venues/:roomId',
        template: '<room></room>'
      })
  }])

  .run(['$rootScope', ($rootScope) => {
    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      // Clear the user's current room
      if(Meteor.userId()) Meteor.call("user.checkLogout", Meteor.userId());
    })
  }])

function onReady() {
  angular.bootstrap(document, ['turn-table']);
}

if (Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady);
} else {
  angular.element(document).ready(onReady);
}
