var db = require('../config/database.js');

var publicFields = '_id title url tags content created';

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
	var query = db.postModel.find();
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

exports.read = function(req, res) {
	var id = req.params.id;
	if (id === undefined || id == '') {
		return res.send(400);
	}

	var query = db.postModel.findOne({_id: id});
	query.select(publicFields);
	query.exec(function(err, result) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
			return res.json(200, result);
		});
	});
};

exports.create = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}

	var post = req.body.post;
	if (post === undefined || post.title === undefined || post.content === undefined 
		|| post.tags === undefined) {
		return res.send(400);
	}

	var postEntry = new db.postModel();
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
}

exports.update = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}

	var post = req.body.post;

	if (post === undefined || post._id === undefined) {
		res.send(400);
	}

	var updatePost = {};

	if (post.title !== undefined && post.title != "") {
		updatePost.title = post.title;
	} 

	if (post.tags !== undefined) {
		if (Object.prototype.toString.call(post.tags) === '[object Array]') {
			updatePost.tags = post.tags;
		}
		else {
			updatePost.tags = post.tags.split(',');
		}
	}

	if (post.is_published !== undefined) {
		updatePost.is_published = post.is_published;
	}

	if (post.content !== undefined && post.content != "") {
		updatePost.content = post.content;
	}

	updatePost.updated = new Date();

	db.postModel.update({_id: post._id}, updatePost, function(err, nbRows, raw) {
		return res.send(200);
	});
};

exports.delete = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}

	var id = req.params.id;
	if (id === undefined || id == '') {
		res.send(400);
	} 

	var query = db.postModel.findOne({_id:id});

	query.exec(function(err, result) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		result.remove();
		return res.send(200);
	});
};

exports.listByTag = function(req, res) {
	var tagName = req.params.tagName;
	if (tagName === undefined || tagName == '') {
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
