import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './playlistEditor.html';

import playlistService from '../../services/playlist.js';
import youtubeService from '../../services/youtube.js';

class PlaylistEditorCtrl {

  constructor($scope, playlistService, $timeout, youtubeService, $interval) {
    SC.initialize({ client_id: Meteor.settings.public.apis.soundcloud.client_id });
    this.$interval = $interval;
    this.scope = $scope;
    var $ctrl = this;
    this.currentPlaylist = {};
    this.display = 'list';
    this.edit = false;
    this.$modal = $("#new-playlist-modal");
    this.ps = playlistService;
    this.ytService = youtubeService;
    this.source = "soundcloud";

    this.searchResults = [];
    this.selectedTracks = [];

    this.sortableOptions = {
      stop: () => {
        $ctrl.savePlaylist($ctrl.currentPlaylist)
      },
      axis: 'y'
    };

    $scope.query = "";

    $scope.ps = playlistService;
    $scope.$watch('ps.currentPlaylist', function(newVal) {
      $ctrl.currentPlaylist = newVal;
    });

    var timeoutPromise;
    var delayInMs = 750;
    $scope.$watch("query", function(query) {
      if(!!query) {
        $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
        timeoutPromise = $timeout(function(){   //Set timeout
          $scope.loading = true;
          if(/soundcloud.com/.test(query)){
            $ctrl.searchSoundcloud(query, true)
          } else if(/youtube.com/.test(query)){
            $ctrl.searchYoutube(query)
          } else {
            $ctrl.source == "soundcloud" ? $ctrl.searchSoundcloud(query) : $ctrl.searchYoutube(query);
          }
        }, delayInMs);
      }
    });

  }

  searchYoutube(query) {
    let $ctrl = this;
    this.ytService.searchFor(query).then((resp, err) => {
      $ctrl.searchResults = resp.items.map((item) => {
        return {
          id: item.id,
          title: item.snippet.title,
          image: item.snippet.thumbnails.default.url,
          duration: item.contentDetails.duration
        }
      });
    })
  }

  searchSoundcloud(query, isUrl) {
    let $ctrl = this;
    if(!!isUrl){
      SC.resolve(query).then((resp) => {
        let tracks = resp.kind == "playlist" ? resp.tracks : [resp];
        $ctrl.parseSCTracks(tracks);
      })
    } else {
      SC.get('/tracks', {
        q: query,
        limit: 25
      }).then(function(tracks) {
        $ctrl.parseSCTracks(tracks);
      });
    }
  }

  parseSCTracks(tracks) {
    this.searchResults = _.map(tracks, (track) => {
      return {
        id: track.id,
        image: track.artwork_url || track.user.avatar_url,
        title: track.title,
        source: "soundcloud"
      }
    })
    this.scope.$apply();
  }

  importAll() {
    this.saveTracks(this.currentPlaylist, this.searchResults);
  }

  removeTrack(track) {
    this.currentPlaylist.tracks = _.without(this.currentPlaylist.tracks, track);
    this.savePlaylist()
  }

  saveTracks(playlist, tracks){
    tracks = tracks || Array.from(this.selectedTracks);
    playlist.tracks = playlist.tracks || [];
    playlist.tracks = _.uniq(playlist.tracks.concat(tracks));
    this.ps.currentPlaylist = playlist;
    this.selectedTracks = [];
    this.searchResults = [];
    this.savePlaylist(playlist);
  }

  previewTrack() {
  }

  clearSearch(){
    this.selectedTracks = [];
    this.searchResults = [];
  }

  selectTrack(track) {
    if(this.trackSelected(track)) {
      this.selectedTracks = _.without(this.selectedTracks, track);
    } else {
      this.selectedTracks.push(track);
    }
  }

  removeSelected(playlist){
    this.ps.currentPlaylist.tracks = _.without.apply(this, [playlist.tracks].concat(this.selectedTracks));
    this.selectedTracks = [];
  }

  trackSelected(track) {
    return _.contains(this.selectedTracks, track);
  }

  hasSearchedTracks() {
    return this.searchResults.length > 0;
  }

  hasSelectedTracks(type){
    let selected = this.selectedTracks.length > 0;
    let tracks = this.ps.currentPlaylist.tracks
    switch(type) {
      case "saved":
        return selected && tracks && tracks.length > 0 && !this.hasSearchResults();
      case "searched":
        return selected && this.hasSearchResults();
      default:
        return selected && this.hasSearchResults();
    }
    return this.selectedTracks.length > 0;
  }

  hasSearchResults(){
    return this.searchResults.length > 0;
  }

  editTitle(edit, save) {
    if(save){ this.savePlaylist() }
    if(typeof edit == 'boolean'){ this.edit = edit; }
    return this.edit || false;
  }

  savePlaylist(playlist) {
    if(!playlist) { playlist = this.currentPlaylist; }
    this.ps.savePlaylist(playlist);
  }

  close() {
    $("#playlist-editor").fadeOut(200);
    $("#content-wrapper").fadeIn(200);
  }

}

PlaylistEditorCtrl.$inject = ['$scope', playlistService.name, '$timeout', youtubeService.name, '$interval']

export default angular.module('playlistEditor', [
  angularMeteor,
  playlistService.name,
  youtubeService.name
])
  .component('playlistEditor', {
    templateUrl: 'imports/components/playlistEditor/playlistEditor.html',
    controller: PlaylistEditorCtrl,
  });
