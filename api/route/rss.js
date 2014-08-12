var Feed    = require('feed');
var config  = require('../config/config.js');
var db      = require('../config/mongo_database.js');

var publicFields = '_id title url tags content created likes';

exports.index = function(req, res){
  var feed = new Feed(config.rss);
  var query = db.postModel.find({is_published: true});

  query.select(publicFields);
  query.sort('-created');
  query.exec(function(err, results) {
      if (err) {
          console.log(err);
          return res.send(400);
      }

      for (var postKey in results) {
        feed.item({
          title : results[postKey].title,
          link  : config.url+'/#/post/'+results[postKey]._id,
          description : results[postKey].content.substr(0, 400) + '...',
          date: results[postKey].created
        })
      }
    
      res.set('Content-Type', 'text/xml');
      res.send(feed.render('rss-2.0'));
  });
}