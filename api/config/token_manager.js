var redisClient = require('./redis_database').redisClient;
var TOKEN_EXPIRATION = 60;
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

// Middleware for token verification
exports.verifyToken = function (req, res, next) {
	var token = getToken(req.headers);

	redisClient.get(token, function (err, reply) {
		if (err) {
			console.log(err);
			return res.send(500);
		}

		if (reply) {
			res.send(401);
		}
		else {
			next();
		}

	});
};

exports.expireToken = function(headers) {
	var token = getToken(headers);
	
	if (token != null) {
		redisClient.set(token, { is_expired: true });
    	redisClient.expire(token, TOKEN_EXPIRATION_SEC);
	}
};

var getToken = function(headers) {
	if (headers && headers.authorization) {
		var authorization = headers.authorization;
		var part = authorization.split(' ');

		if (part.length == 2) {
			var token = part[1];

			return part[1];
		}
		else {
			return null;
		}
	}
	else {
		return null;
	}
};

exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;