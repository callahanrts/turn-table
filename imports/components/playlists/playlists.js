import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './playlists.html';
import playlistService from '../../services/playlist.js';
import { Playlists } from '../../api/playlists.js';

class PlaylistsCtrl {

  constructor($scope, playlistService, $reactive) {
    this.playlistService = playlistService;
    $scope.viewModel(this);
    this.subscribe('playlists');
    let reactiveContext = $reactive(this).attach($scope);

    reactiveContext.helpers({
      user: () => { return Meteor.user() },
      playlists() {
        const selector = {};

        // Show newest playlists at the top
        return Playlists.find(selector, {
          sort: {
            createdAt: -1
          }
        });
      },
    })

  }

  newPlaylist() {
    this.playlistService.editPlaylist(this.playlistSkeleton());
    $("#playlist-editor").fadeIn(200);
    $("#content-wrapper").fadeOut(200);
  }

  playlistSkeleton() {
    return {
      name: "New Playlist",
      active: Playlists.find().fetch().length == 0,
      tracks: []
    }
  }

  editPlaylist(playlist) {
    console.log(playlist);
    this.playlistService.editPlaylist(playlist);
    $("#playlist-editor").fadeIn(200);
    $("#content-wrapper").fadeOut(200);
  }

}

PlaylistsCtrl.$inject = ['$scope', 'playlistService', '$reactive'];

export default angular.module('playlists', [
  angularMeteor,
  playlistService.name
])
  .component('playlists', {
    templateUrl: 'imports/components/playlists/playlists.html',
    controller: PlaylistsCtrl,
  });
