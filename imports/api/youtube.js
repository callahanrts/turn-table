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

var importPlaylist = (future, id, pageToken) => {
  let items = [];
  let result = {};
  do {
    result = playlistItems(id, result.pageToken).wait();
    items = items.concat(result.items);
  } while(!!result.pageToken)
  future.return({ items: items });
}

var playlistItems = (id, pageToken) => {
  let future = new Future();
  let searchOptions = {
    playlistId: id,
    part: 'id,contentDetails',
    maxResults: 50
  }
  if(!!pageToken){ searchOptions.pageToken = pageToken; }
  YoutubeApi.playlistItems.list(searchOptions, (err, data) => {
    let items = !!err ? [] : data.items;
    let ids = _.compact(items.map((el) => { return el.contentDetails.videoId; }))
    let videos = importVideos(future, ids, data.nextPageToken);
    //future.return({ items: videos, pageToken: data.pageToken });
  })
  return future;
}

var importVideos = (future, ids, pageToken) => {
  YoutubeApi.videos.list({
    part: "id,snippet,contentDetails",
    id: ids.join(',')
  }, (err, data) => {
    //if(!!err) future.throw(err);
    future.return({ items: data.items, pageToken: pageToken });
  })
}

// var importVideos = (future, ids, pageToken) => {
//   YoutubeApi.videos.list({
//     part: "id,snippet,contentDetails",
//     id: ids.join(',')
//   }, (err, data) => {
//     future['return'](data, err);
//   })
// }

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
