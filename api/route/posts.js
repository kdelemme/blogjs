var db = require('../config/database.js');

var isAdmin = true;

exports.list = function(req, res) {
	query = {};
	if (!isAdmin) {
		query = {is_published: true};
	}

	db.postModel.find(query, function(err, results) {
  		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		//Do not display the whole post
  		for (var postKey in results) {
    		results[postKey].content = results[postKey].content.substr(0, 400) + '...';
    		if (!isAdmin) {
    			results[postKey].read = undefined;
    			results[postKey].updated = undefined;
    			results[postKey].is_published = undefined;
    			results[postKey].__v = undefined;
    			results[postKey]._id = undefined;
    		}
		}

  		return res.json(200, results);
  	});
};

exports.read = function(req, res) {
	var url = req.params.url;
	if (url === undefined) {
		return res.json(400);
	}

	//TODO Update MongoDB document: inc read_counter
	db.postModel.findOne({url: url}, function(err, result) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		if (!isAdmin) {
			result.read = undefined;
			result.updated = undefined;
			result.is_published = undefined;
			result.__v = undefined;
			result._id = undefined;
		}

		result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
			return res.json(200, result);
		});
	});
};

exports.create = function(req, res) {
	var post = req.body.post;
	if (post === undefined || post.title === undefined || post.content === undefined 
		|| post.url === undefined || post.tags === undefined) {
		res.send(400);
	}

	post.tags = post.tags.split(',');
	post.url = post.url.replace(/\s/g , '-');

	var postEntry = new db.postModel();
	postEntry.title = post.title;
	postEntry.url = post.url;
	postEntry.tags = post.tags;
	postEntry.is_published = post.is_published;
	postEntry.content = post.content;

	console.log(postEntry);

	postEntry.save(function(err) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		return res.send(200);
	});
}

exports.update = function(req, res) {
	var post = req.body.post;

	if (post === undefined || post._id === undefined) {
		res.send(400);
	}

	var updatePost = {};

	if (post.title !== undefined && post.title != "") {
		updatePost.title = post.title;
	} 

	if (post.url !== undefined && post.url != "") {
		updatePost.url = post.url;
	}

	if (post.tags !== undefined) {
		if (Object.prototype.toString.call( post.tags ) === '[object Array]') {
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
	var id = req.params.id;
	if (id === undefined) {
		res.send(400);
	} 

	db.postModel.findOne({_id: id}, function(err, result) {
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
	if (tagName === undefined) {
		res.send(400);
	}

	query = { tags: tagName };

	db.postModel.find(query, function(err, results) {
  		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		//Do not display the whole post
  		for (var postKey in results) {
    		results[postKey].content = results[postKey].content.substr(0, 400) + '...';
			results[postKey].read = undefined;
			results[postKey].updated = undefined;
			results[postKey].is_published = undefined;
			results[postKey].__v = undefined;
			results[postKey]._id = undefined;
		}

  		return res.json(200, results);
  	});

}