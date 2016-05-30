import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  // This code only runs on the server

  YoutubeApi.authenticate({
    type: 'key',
    key: 'AIzaSyASgfQGx9L-SydlxHkwsmoQ1PCy0pYDfLg'
  });

}

// Use an http client
// wrap the method in Meteor._wrapAsync
// http://docs.meteor.com/#/full/meteor_wrapasync
Meteor.methods({ 'youtube.search' (query) {
    let future = new Future();

    if(/v=/.test(query)){
      importVideos(future, [getParameterByName('v', query)])
    } else if(/list=/.test(query)) {
      importPlaylist(future, getParameterByName('list', query))
    } else {
      searchYoutube(future, {
        part: "id",
        type: "video",
        maxResults: 15,
        q: query
      })
    }

    return future.wait();
  },

});

var importPlaylist = (future, id) => {
  YoutubeApi.playlistItems.list({
    playlistId: id,
    part: 'id,contentDetails',
    maxResults: 50
  }, (err, data) => {
    console.log(err, data)
    let ids = _.compact(data.items.map((el) => {
      return el.contentDetails.videoId;
    }));

    importVideos(future, ids);
  })
}

var importVideos = (future, ids) => {
  YoutubeApi.videos.list({
    part: "id,snippet,contentDetails",
    id: ids.join(',')
  }, (err, data) => {
    future['return'](data, err);
  })
}

var searchYoutube = (future, options) => {
  options = options || {}

  YoutubeApi.search.list(options, (err, data) => {
    let ids = _.map(data.items, (video) => {
      return video.id.videoId
    });
    YoutubeApi.videos.list({
      part: "id,snippet,contentDetails",
      id: ids.join(',')
    }, (err, data) => {
      future['return'](data, err);
    })
  })
}

var getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
