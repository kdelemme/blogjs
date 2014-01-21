var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , db = require('./database');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.userModel.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
    db.userModel.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }

        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

//Middleware to check if user is authenticated
exports.userIsAuthenticated = function userIsAuthenticated(req, res, next) {
    if (req.user) { return next(); }
    res.send(401);
};