var passport = require('passport');
var db = require('../config/database.js');

exports.login = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err) }
		if (!user) {
	  		return res.json(400);
		}
		req.logIn(user, function(err) {
		  	if (err) { return next(err); }
		  	return res.send(200);
		});
	})(req, res, next);
};

exports.logout = function(req, res) {
	req.session.destroy();
	req.logout();
	res.send(200);
}


/*
	================= CREATE YOUR USER ===============
	============ DELETE AFTER FIRST USAGE ============
	var user = new db.userModel();
	user.username = "YOUR_USERNAME";
	user.password = "YOUR_PASSWORD";

	user.save(function(err) {
		if (err) {
		  console.log(err);
		}
		console.log("User Created ! Stop nodejs and remove those lines");
	});
*/