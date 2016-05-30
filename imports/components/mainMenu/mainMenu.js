import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './mainMenu.html';

import settingsService from '../../services/settings.js';
import { Rooms } from '../../api/rooms.js';

class MainMenuCtrl {

  constructor(settingsService, $reactive, $scope, $stateParams) {
    $scope.viewModel(this);
    this.subscribe('rooms');
    let reactiveContext = $reactive(this).attach($scope);

    reactiveContext.helpers({
      user: () => { return Meteor.user() },
      room: () => { return Rooms.findOne($stateParams.roomId) }
    })

    this.settingsService = settingsService;
    this.settings = settingsService.get("mainMenu") || this.defaultSettings();
    this.minimized = this.settings.minimized;
    this.editName = false;
  }

  toggleMinimized() {
    this.minimized = !this.minimized;
    this.settings.minimized = this.minimized;
    this.settingsService.set("mainMenu", this.settings)
  }

  defaultSettings() {
    return { minimized: true };
  }

  admin() {
    return this.room && this.room.admins.indexOf(Meteor.userId()) != -1;
  }

  changeName() {
    this.editName = true;
    setTimeout(() => {
      $("#edit-name").focus();
    })
  }

  saveRoomSettings() {
    Meteor.call('room.updateSettings', this.room._id, this.room.settings)
  }

  saveName() {
    this.editName = false;
    Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": this.user.profile.name }});
  }

  selectAll($event) {
    $event.target.select();
  }

  loggedIn(){
    return !!Meteor.userId();
  }

  logout() {
    Meteor.logout();
  }

}

MainMenuCtrl.$inject = [settingsService.name, '$reactive', '$scope', '$stateParams'];

export default angular.module('mainMenu', [
  angularMeteor,
  settingsService.name,
])
  .component('mainMenu', {
    templateUrl: 'imports/components/mainMenu/mainMenu.html',
    controller: MainMenuCtrl
  });
