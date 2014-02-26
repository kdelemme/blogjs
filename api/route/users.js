var passport = require('passport');
var db = require('../config/database.js');

exports.login = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return res.send(400); }
		if (!user) {
	  		return res.send(400);
		}
		req.logIn(user, function(err) {
		  	if (err) { return res.send(400); }
		  	return res.send(200);
		});
	})(req, res, next);
};

exports.logout = function(req, res) {
	req.session.destroy();
	req.logout();
	res.send(200);
}



	// Uncomment this the first time you ran it. Then delete it and restart.
	// var user = new db.userModel();
	// user.username = "username";
	// user.password = "password";

	// user.save(function(err) {
	// 	if (err) {
	// 	  console.log(err);
	// 	}
	// 	console.log("User Created ! Stop nodejs and remove those lines");
	// });
