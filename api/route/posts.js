var db = require('../config/mongo_database.js');

var publicFields = '_id title url tags content created likes';

exports.list = function(req, res) {
	var query = db.postModel.find({is_published: true});

	query.select(publicFields);
	query.sort('-created');
	query.exec(function(err, results) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		for (var postKey in results) {
    		results[postKey].content = results[postKey].content.substr(0, 400);
    	}

  		return res.json(200, results);
	});
};

exports.listAll = function(req, res) {
	if (!req.user) {
		res.header('Location', '/#/admin/login');
		return res.send(301);
	}

	db.userModel.findById(req.user.id, function (err, user) {
		if (err || !user) {
			console.log(err ? err : 'Bad user id: ' + post._id);
			return res.send(400, err ? err.message : 'User not found.');
		}
		var q = user.isAdmin ? {} : {uid: req.user.id},
			query = db.postModel.find(q, {tags: 0, content: 0});
		query.sort('-created');
		query.exec(function(err, results) {
			if (err) {
  				console.log(err);
  				return res.send(400, err.message);
  			}

  			return res.json(200, results);
  		});
	});
};

exports.read = function(req, res) {
	var id = req.params.id || '';
	if (id == '') {
		return res.send(400);
	}

	var query = db.postModel.findOne({_id: id});
	query.select(publicFields);
	query.exec(function(err, result) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		if (result != null) {
  			result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
				return res.json(200, result);
			});
  		} else {
  			return res.send(400);
  		}
	});
};

exports.like = function(req, res) {
	var id = req.body.id || '';
	if (id == '') {
		return res.send(400);
	}


	db.postModel.update({_id: id}, { $inc: { likes: 1 } }, function(err, nbRows, raw) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		return res.send(200);
	});
}

exports.unlike = function(req, res) {
	var id = req.body.id || '';
	if (id == '') {
		return res.send(400);
	}


	db.postModel.update({_id: id}, { $inc: { likes: -1 } }, function(err, nbRows, raw) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		return res.send(200);
	});
}

exports.create = function(req, res) {
	if (!req.user) {
		res.header('Location', '/#/admin/login');
		return res.send(301);
	}

	var post = req.body.post;
	if (post == null || post.title == null || post.content == null
		|| post.tags == null) {
		return res.send(400, 'Post is not complete.');
	}

	db.userModel.findById(req.user.id, function (err, user) {
		if (err || !user) {
			console.log(err ? err : 'Bad user id: ' + post._id);
			return res.send(400, err ? err.message : 'User not found.');
		}

		var postEntry = new db.postModel();
		postEntry.uid = req.user.id;
		postEntry.title = post.title;
		postEntry.tags = post.tags.split(',');
		postEntry.is_published = post.is_published;
		postEntry.content = post.content;

		postEntry.save(function(err) {
			if (err) {
				console.log(err);
				return res.send(400);
			}

			return res.send(200);
		});
	});
}

/**
	Update post actually
	@param {Object} post - req.body.post
	@param {Function} callback - callback(statusCode, message)
*/
var _update = function(post, callback) {
	if (post == null || post._id == null) {
		return callback(400, 'Post not found.');
	}

	var updatePost = {};

	if (post.title != null && post.title !== "") {
		updatePost.title = post.title;
	}

	if (post.tags != null) {
		if (Object.prototype.toString.call(post.tags) === '[object Array]') {
			updatePost.tags = post.tags;
		}
		else {
			updatePost.tags = post.tags.split(',');
		}
	}

	if (post.is_published != null) {
		updatePost.is_published = post.is_published;
	}

	if (post.content != null && post.content !== "") {
		updatePost.content = post.content;
	}

	updatePost.updated = new Date();

	db.postModel.update({_id: post._id}, updatePost, function(err, nbRows, raw) {
		if (err) {
			console.log(err);
			return callback(400, err.message);
		}
		return callback(200, '');
	});
};

exports.update = function(req, res) {
	if (!req.user) {
		res.header('Location', '/#/admin/login');
		return res.send(301);
	}

	db.userModel.findById(req.user.id, function (err, user) {
		if (err || !user) {
			console.log(err ? err : 'Bad user id: ' + post._id);
			return res.send(400, err ? err.message : 'User not found.');
		}

		var post = req.body.post;
		db.postModel.findById(post._id, function (err, result) {
			if (err || !result) {
				console.log(err ? err : 'Bad post id: ' + post._id);
				return res.send(400, err ? err.message : 'Post not found.');
			}
			if (result.uid !== req.user.id) {
				return res.send(400, 'Only the author can update.');
			}
			_update(post, function (code, message) {
				return res.send(code, message);
			});
		});
	});
};

exports.delete = function(req, res) {
	if (!req.user) {
		res.header('Location', '/#/admin/login');
		return res.send(301);
	}

	var id = req.params.id;
	if (id == null || id === '') {
		res.send(400, 'Post not specified.');
	}

	db.userModel.findById(req.user.id, function (err, user) {
		if (err || !user) {
			console.log(err ? err : 'Bad user id: ' + post._id);
			return res.send(400, err ? err.message : 'User not found.');
		}

		var query = db.postModel.findOne({_id:id});

		query.exec(function(err, result) {
			if (err || !result) {
				console.log(err ? err : 'Bad post id: ' + post._id);
				return res.send(400, err ? err.message : 'Post not found.');
			}

			if (!user.isAdmin && user.id !== result.str) {
				return res.send(400, 'Requires authorization.');
			}

			result.remove();
			return res.send(200);
		});
	});
};

exports.listByTag = function(req, res) {
	var tagName = req.params.tagName || '';
	if (tagName == '') {
		return res.send(400);
	}

	var query = db.postModel.find({tags: tagName, is_published: true});
	query.select(publicFields);
	query.sort('-created');
	query.exec(function(err, results) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		for (var postKey in results) {
    		results[postKey].content = results[postKey].content.substr(0, 400);
    	}

  		return res.json(200, results);
	});
}
