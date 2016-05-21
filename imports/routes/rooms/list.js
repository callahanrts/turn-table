import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './list.html';

export default angular.module('rooms', [
  angularMeteor
])
  .component('rooms', {
    templateUrl: 'imports/routes/rooms/list.html'
  });
