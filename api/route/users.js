var db = require('../config/database');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');

exports.signin = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	
	if (username == '' || password == '') { 
		return res.send(401); 
	}

	db.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (user == undefined) {
			return res.send(401);
		}
		
		user.comparePassword(password, function(isMatch) {
			if (!isMatch) {
				console.log("Attempt failed to login with " + user.username);
				return res.send(401);
            }

			var token = jwt.sign(user._id, secret.secretToken, { expiresInMinutes: 60 });
			
			return res.json({token:token});
		});

	});
};

exports.logout = function(req, res) {
	if (req.user) {
		delete req.user;	
		res.send(200);
	}
	else {
		res.send(401);
	}
}

exports.register = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';

	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.send(400);
	}

	var user = new db.userModel();
	user.username = username;
	user.password = password;

	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.send(500);
		}	
		
		db.userModel.count(function(err, counter) {
			if (err) {
				console.log(err);
				return res.send(500);
			}

			if (counter == 1) {
				db.userModel.update({username:user.username}, {is_admin:true}, function(err, nbRow) {
					if (err) {
						console.log(err);
						return res.send(500);
					}

					console.log('First user created as an Admin');
					return res.send(200);
				});
			} 
			else {
				return res.send(200);
			}
		});
	});
}