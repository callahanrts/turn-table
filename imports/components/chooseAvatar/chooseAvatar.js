import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './chooseAvatar.html';

class ChooseAvatarCtrl {

  constructor() {
    this.themeIndex = 0;
    this.themes = [
      { title: 'Base', avatars: ['base01', 'base02', 'base03', 'base04', 'base05', 'base06', 'base07', 'base08', 'base09', 'base10', 'base11', 'base12', 'base13', 'base14', 'base15']},
      { title: "80s", avatars: ['80s01', '80s02', '80s03', '80s04', '80s05', '80s06', '80s07', '80s08', '80s09', '80s10', '80s11', '80s12', '80s13', '80s14', '80s15'] },
      { title: 'Winter', avatars: ['2014winter-s01', '2014winter-s02', '2014winter-s03', '2014winter-s04', '2014winter-s05', '2014winter-s06', '2014winter-s07', '2014winter-s08', '2014winter-s09', '2014winter-s10'] },
      { title: 'Admin', avatars: ['admin01', 'admin02', 'admin03', 'admin04', 'admin05', 'admin06', 'admin07', 'admin08', 'admin09']},
      { title: 'Beach', avatars: ['beach-e01', 'beach-e02', 'beach-s01', 'beach-s02', 'beach-s03', 'beach-s04', 'beach-s05', 'beach-s06', 'beach-s07', 'beach-t01', 'beach-t02', 'beach-t03', 'beach-t04']},
      { title: 'Classic', avatars: ['classic01', 'classic02', 'classic03', 'classic04', 'classic05', 'classic06', 'classic07', 'classic08', 'classic09', 'classic10', 'classic11']},
      { title: 'Country', avatars: ['country01', 'country02', 'country03', 'country04', 'country05', 'country06', 'country07', 'country08', 'country09', 'country10', 'country11', 'country12', 'country13', 'country14', 'country15']},
      { title: 'Diner', avatars: ['diner-e01', 'diner-e02', 'diner-s01', 'diner-s02', 'diner-s03', 'diner-s04', 'diner-s05', 'diner-s06', 'diner-s07', 'diner-s08', 'diner-s09', 'diner-s10', 'diner-t01', 'diner-t02', 'diner-t03', 'diner-t04']},
      { title: 'Dragon', avatars: ['dragon-e01', 'dragon-e02', 'dragon-e03', 'dragon-e04']},
      { title: 'Hip Hop', avatars: ['hiphop-s01', 'hiphop-s02', 'hiphop01', 'hiphop02', 'hiphop03', 'hiphop04', 'hiphop05', 'hiphop06', 'hiphop07', 'hiphop08', 'hiphop09', 'hiphop10', 'hiphop11', 'hiphop12', 'hiphop13', 'hiphop14', 'hiphop15']},
      { title: 'Island', avatars: ['island-e01', 'island-e02', 'island-s01', 'island-s02', 'island-s03', 'island-s04', 'island-s05', 'island-s06', 'island-t01', 'island-t02', 'island-t03', 'island-t04']},
      { title: 'NYC', avatars: ['nyc-e01', 'nyc-e02', 'nyc-s01', 'nyc-s02', 'nyc-s03', 'nyc-s04', 'nyc-s05', 'nyc-s06', 'nyc-t01', 'nyc-t02', 'nyc-t03', 'nyc-t04']},
      { title: 'Rave', avatars: ['rave01', 'rave02', 'rave03', 'rave04', 'rave05', 'rave06', 'rave07', 'rave08', 'rave09', 'rave10', 'rave11', 'rave12', 'rave13', 'rave14', 'rave15']},
      { title: 'Robot', avatars: ['robot-s01', 'robot-s02', 'robot01', 'robot02', 'robot03', 'robot04', 'robot05', 'robot06', 'robot07', 'robot08', 'robot09', 'robot10', 'robot11', 'robot12', 'robot13', 'robot14', 'robot15']},
      { title: 'Rock', avatars: ['rock01', 'rock02', 'rock03', 'rock04', 'rock05', 'rock06', 'rock07', 'rock08', 'rock09', 'rock10', 'rock11', 'rock12', 'rock13', 'rock14', 'rock15']},
      { title: 'Sea', avatars: ['sea-e01', 'sea-e02', 'sea-s01', 'sea-s02', 'sea-s03', 'sea-s04', 'sea-s05', 'sea-s06', 'sea-s07', 'sea-t01', 'sea-t02', 'sea-t03', 'sea-t04']},
      { title: 'Warrior', avatars: ['warrior-s01', 'warrior-s02', 'warrior-s03', 'warrior-s04', 'warrior-s05', 'warrior-s06', 'warrior01', 'warrior02', 'warrior03', 'warrior04', 'warrior05', 'warrior06', 'warrior07', 'warrior08', 'warrior09']},
      { title: 'Zoo', avatars: ['zoo-s01', 'zoo-s02', 'zoo-s03', 'zoo-s04', 'zoo-s05', 'zoo-s06', 'zoo01', 'zoo02', 'zoo03', 'zoo04', 'zoo05', 'zoo06', 'zoo07', 'zoo08', 'zoo09', 'zoo10', 'zoo11', 'zoo12', 'zoo13', 'zoo14', 'zoo15']},
      { title: 'Halloween', avatars: ['2014hw01', '2014hw02', '2014hw03', '2014hw04', '2014hw05', '2014hw06', '2014hw07', '2014hw08', '2014hw09', '2014hw10', '2014hw11', '2014hw12', '2014hw13', '2014hw14', '2014hw15']},
      { title: 'Misc', avatars: ['steve01', 'tastycat', 'tastycat02', 'ba01', 'ba02', 'ba03', 'ba04']}
    ]

  }

  close() {
    $("#avatars").fadeOut(200);
    $("#content-wrapper").fadeIn(200);
  }

  myAvatar(avatar) {
    return Meteor.user() && avatar == Meteor.user().profile.avatar;
  }

  selectAvatar(avatar) {
    Meteor.call("user.updateAvatar", avatar);
  }

}

ChooseAvatarCtrl.$inject = [];

export default angular.module('chooseAvatar', [
  angularMeteor,
])
  .component('chooseAvatar', {
    templateUrl: 'imports/components/chooseAvatar/chooseAvatar.html',
    controller: ChooseAvatarCtrl,
  });
