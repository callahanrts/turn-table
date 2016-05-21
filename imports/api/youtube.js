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

    listYoutube(future, {
      part: "id",
      type: "video",
      maxResults: 15,
      q: query
    })

    return future.wait();
  },

});

var listYoutube = (future, options) => {
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
