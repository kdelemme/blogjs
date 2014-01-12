var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var uristring = 'mongodb://localhost/blog';

var mongoOptions = { };

mongoose.connect(uristring, mongoOptions, function (err, res) {
    if (err) { 
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Successfully connected to: ' + uristring);
    }
});

var Schema = mongoose.Schema;

// User schema
var User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
});

var Post = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    tags: [{type: String}],
    is_published: { type: Boolean, default: false },
    content: { type: String, required: true },
    created: {type: Date, default: Date.now },
    updated: { type: Date, default: Date.now},
    read: { type: Number, default: 0 }
});


// Bcrypt middleware on UserSchema
User.pre('save', function(next) {
  var user = this;

  if(!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//Password verification
User.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


//Define Models
var userModel = mongoose.model('User', User);
var postModel = mongoose.model('Post', Post);


// Export Models
exports.userModel = userModel;
exports.postModel = postModel;