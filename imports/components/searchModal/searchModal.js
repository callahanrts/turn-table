import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './searchModal.html';

import playlistService from '../../services/playlist.js'

import { Playlists } from '../../api/playlists.js';

class SearchModalCtrl {

  constructor($scope, playlistService) {
    this.edit = false;
    this.$modal = $("#new-playlist-modal");
    this.ps = playlistService;

    this.$modal.on('show.bs.modal', function(e){
      $scope.currentPlaylist = playlistService.currentPlaylist;
    })

  }

  editTitle(edit) {
    if(typeof edit == 'boolean'){
      this.edit = edit;
    }
    return this.edit || false;
  }

  savePlaylist(playlist) {
    this.ps.savePlaylist(playlist);
    this.$modal.modal('hide');
  }

}

SearchModalCtrl.$inject = ['$scope', 'playlistService']

export default angular.module('searchModal', [
  angularMeteor,
  playlistService.name
])
  .component('searchModal', {
    templateUrl: 'imports/components/searchModal/searchModal.html',
    controller: SearchModalCtrl,
  });
