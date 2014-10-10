/*
 * Post comments. Support pagination.
*/
var db = require('../config/mongo_database.js');
var redis = require('../config/redis_database').redisClient;
var users = require('./users');

var toInt = function(v) {
    if (v === null || v === undefined) { return null; }
    return parseInt(v) || null;
};

exports.list = function(req, res) {
    var postid = req.params.postid || '',
        page = toInt(req.query.page) || 1;

    if (!postid) { return res.send(400); }

    var query = db.comtModel.find({pid: postid}, {_id:  0});
    query.sort('-created');
    if (page > 1) {
        query.skip( (page - 1) * pageSize );
    }
    query.limit(10);

    query.exec(function(err, results) {
        if (err) {
            console.log(err);
            return res.send(500, err.message);
        }
        if (results.length === 0) {
            return res.send(200);
        }

        // get distinct user id list
        var i, j = [], ids = [];
        for (i=0; i<results.length; i++) {
            var uid = results[i].uid;
            if (j.indexOf(uid) === -1) {
                j.push( uid );
                ids.push( new db.ObjectId(uid) );
            }
        }
        // search user names and return
        db.userModel.find({
            _id: {$in: uids}
        }, {
            username: 1
        }, function(err, users) {
            return res.json(200, {
                comments: results,
                users: users
            });
        });
    });
};

exports.create = function(req, res) {
    if (!req.user) {
        return res.send(401);
    }
    var postid = req.body.postid,
        content = req.body.content;
    if (!postid || !content) {
        return res.send(400, 'Invalid comment');
    }

    db.userModel.findById(req.user.id, function (err, user) {
        if (err || !user) {
            err && console.log(err);
            return res.send(400, err ? err.message : 'Invalid user');
        }
        db.postModel.findById(postid, function (err, post) {
            if (err || !post) {
                err && console.log(err);
                return res.send(404, 'Invalid post');
            }

            var comtEntry = new db.comtModel();
            comtEntry.uid = req.user.id;
            comtEntry.pid = postid;
            comtEntry.content = content;
            comtEntry.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.send(500, err.message);
                }
                return res.send(200);
            });
        });
    });
}
