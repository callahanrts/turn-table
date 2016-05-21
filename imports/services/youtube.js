import angular from 'angular';
import angularMeteor from 'angular-meteor';

class youtubeService {

  constructor($http, $q) {
    this.$q = $q;
  }

  searchFor(query) {
    let dfd = this.$q.defer()

    Meteor.call('youtube.search', query, function(err, data){
      if(err){
        dfd.reject(err);
      } else {
        dfd.resolve(data);
      }
    })

    return dfd.promise;
  }

}

youtubeService.$inject = ['$http', '$q'];

export default angular.module('youtubeService', [
  angularMeteor
])
  .service('youtubeService', youtubeService);
