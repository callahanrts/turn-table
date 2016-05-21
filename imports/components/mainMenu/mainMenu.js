import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './mainMenu.html';

import settingsService from '../../services/settings.js';

class MainMenuCtrl {

  constructor(settingsService, $reactive, $scope) {
    let reactiveContext = $reactive(this).attach($scope);
    reactiveContext.helpers({
      user: () => { return Meteor.user() }
    })

    this.settingsService = settingsService;
    this.settings = settingsService.get("mainMenu") || this.defaultSettings();
    this.minimized = this.settings.minimized;
    this.editName = false;
  }

  toggleMinimized() {
    console.log('toggle minimized')
    this.minimized = !this.minimized;
    this.settings.minimized = this.minimized;
    this.settingsService.set("mainMenu", this.settings)
  }

  myAccount() {
    console.log('my account')
  }

  defaultSettings() {
    return { minimized: true };
  }

  changeName() {
    this.editName = true;
    setTimeout(() => {
      $("#edit-name").focus();
    })
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
    this.meteor.logout();
  }

}

MainMenuCtrl.$inject = [settingsService.name, '$reactive', '$scope'];

export default angular.module('mainMenu', [
  angularMeteor,
  settingsService.name,
])
  .component('mainMenu', {
    templateUrl: 'imports/components/mainMenu/mainMenu.html',
    controller: MainMenuCtrl
  });
