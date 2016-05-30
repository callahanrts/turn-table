import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Playlists } from '../api/playlists.js';

class playlistService {

  constructor() {
    this.currentPlaylist = {};
  }

  editPlaylist(playlist) {
    this.currentPlaylist = playlist;
  }

  activate(playlist, $event){
    Meteor.call('playlists.update', playlist, { active: true });

    // Prevent bubbling to showItem.
    // On recent browsers, only $event.stopPropagation() is needed
    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
    $event.returnValue = false;
  }

  remove(playlist, $event){
    if(confirm("Are you sure you want to delete this playlist?")){
      Meteor.call('playlists.remove', playlist);

      // Prevent bubbling to showItem.
      // On recent browsers, only $event.stopPropagation() is needed
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
    }
  }

  savePlaylist(playlist) {
    this.removeHashKeys(playlist);
    if(!!playlist._id){
      Meteor.call('playlists.update', playlist)
    } else {
      Meteor.call('playlists.insert', playlist, (err, playlist) => {
        this.currentPlaylist = playlist;
      })
    }
  }

  removeHashKeys(playlist){
    playlist.tracks = playlist.tracks.map((el) => {
      return _.omit(el, "$$hashKey")
    })
  }

}

playlistService.$inject = ['$http'];

export default angular.module('playlistService', [
  angularMeteor
])
  .service('playlistService', playlistService);
