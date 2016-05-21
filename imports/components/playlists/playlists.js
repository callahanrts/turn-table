import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './playlists.html';
import playlistService from '../../services/playlist.js';
import { Playlists } from '../../api/playlists.js';

class PlaylistsCtrl {

  constructor($scope, playlistService) {
    this.playlistService = playlistService;
    $scope.viewModel(this);
    this.subscribe('playlists');

    this.helpers({
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

    $scope.newPlaylist = this.newPlaylist;
    $scope.editTitle = this.editTitle;
  }

  newPlaylist() {
    this.playlistService.editPlaylist({ name: "New Playlist" });
    $("#playlist-editor").fadeIn(200);
    $("#content-wrapper").fadeOut(200);
  }

  editPlaylist(playlist) {
    this.playlistService.editPlaylist(playlist);
    $("#playlist-editor").fadeIn(200);
    $("#content-wrapper").fadeOut(200);
  }

  editTitle(edit) {
    if(typeof edit == 'boolean'){
      this.edit = edit;
    }
    return this.edit || false;
  }

}

PlaylistsCtrl.$inject = ['$scope', 'playlistService']

export default angular.module('playlists', [
  angularMeteor,
  playlistService.name
])
  .component('playlists', {
    templateUrl: 'imports/components/playlists/playlists.html',
    controller: PlaylistsCtrl,
  });
