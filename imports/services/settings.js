import angular from 'angular';
import angularMeteor from 'angular-meteor';

const SETTINGS_KEY = "settings";
class settingsService {

  constructor() {
    this.settings = this.getSettings();
  }

  set(key, val) {
    this.settings[key] = val;
    this.saveSettings();
  }

  get(key) {
    return this.settings[key];
  }

  saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
  }

}

settingsService.$inject = [];

export default angular.module('settingsService', [
  angularMeteor
])
  .service('settingsService', settingsService);
