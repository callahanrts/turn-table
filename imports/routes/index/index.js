import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './index.html';

export default angular.module('index', [
  angularMeteor
])
  .component('index', {
    templateUrl: 'imports/routes/index/index.html'
  });
