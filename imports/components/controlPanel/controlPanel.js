import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './controlPanel.html';

import settingsService from '../../services/settings.js';

class ControlPanelCtrl {

  constructor(settingsService) {
    this.settingsService = settingsService;
    this.settings = settingsService.get("controlPanel") || this.defaultSettings();
    this.pane = this.settings.pane;
  }

  selectPane(pane) {
    this.pane = pane;
    this.settings.pane = pane;
    this.saveSettings();
  }

  defaultSettings() {
    return { pane: "queue" };
  }

  saveSettings() {
    this.settingsService.set("controlPanel", this.settings)
  }

}

ControlPanelCtrl.$inject = [settingsService.name];

export default angular.module('controlPanel', [
  angularMeteor,
  settingsService.name,
])
  .component('controlPanel', {
    templateUrl: 'imports/components/controlPanel/controlPanel.html',
    controller: ControlPanelCtrl
  });
