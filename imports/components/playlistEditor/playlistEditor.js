import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './playlistEditor.html';

import playlistService from '../../services/playlist.js';
import youtubeService from '../../services/youtube.js';

class PlaylistEditorCtrl {

  constructor($scope, playlistService, $timeout, youtubeService, $interval) {
    this.$interval = $interval;
    var $ctrl = this;
    this.currentPlaylist = {};
    this.display = 'list';
    this.edit = false;
    this.$modal = $("#new-playlist-modal");
    this.ps = playlistService;

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
      // $ctrl.createGrid(newVal.tracks || []);
    });

    var timeoutPromise;
    var delayInMs = 750;
    $scope.$watch("query", function(query) {
      if(!!query) {
        $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
        timeoutPromise = $timeout(function(){   //Set timeout
            $scope.loading = true;
            youtubeService.searchFor(query).then((resp, err) => {
              $ctrl.searchResults = resp.items.map((item) => {
                return {
                  id: item.id,
                  title: item.snippet.title,
                  image: item.snippet.thumbnails.default.url,
                  duration: item.contentDetails.duration
                }
              });

              // $ctrl.createGrid($ctrl.searchResults);
            })
        }, delayInMs);
      }
    });

  }

  removeTrack(track) {
    this.currentPlaylist.tracks = _.without(this.currentPlaylist.tracks, track);
    this.savePlaylist()
  }

  saveTracks(playlist){
    let tracks = Array.from(this.selectedTracks);
    playlist.tracks = playlist.tracks || [];
    playlist.tracks = _.uniq(playlist.tracks.concat(tracks));
    this.ps.currentPlaylist = playlist;
    this.selectedTracks = [];
    this.searchResults = [];
    this.savePlaylist(playlist);
    // this.createGrid(playlist.tracks);
  }

  previewTrack() {
  }

  clearSearch(){
    this.selectedTracks = [];
    this.searchResults = [];
    // this.createGrid(this.ps.currentPlaylist.tracks)
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
    // this.createGrid(playlist.tracks);
  }

  trackSelected(track) {
    return _.contains(this.selectedTracks, track);
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

  // createGrid(tracks) {
  //   let i = this.$interval(() => {
  //     // Wait for angular to finish ng-repeat before calling masonry
  //     if(tracks.length == $("#tracks li").length) {
  //       this.$interval.cancel(i);
  //       // Destroy and recreate grid. Not as clean as remove/add/relayout :/
  //       $grid = $("#tracks");
  //       $grid.imagesLoaded(function(){
  //         if($grid.hasClass("masonry")) $grid.masonry('destroy');
  //         $grid.masonry({
  //           columnWidth: 200,
  //           itemSelector: 'li',
  //           transitionDuration: 0,
  //         });
  //       });
  //     }
  //   });
  // }

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
