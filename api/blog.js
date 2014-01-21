var express = require('express')
	, app = express()
	, db = require('./config/database')
	, authentication = require('./config/authentication')
	, passport = require('passport');


//Route
var routes = {};
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');

app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'af5d8dldr818qsp58dsd684qkxekazo1589ddlierf8mpn5dzge5' }));
app.use(passport.initialize());
app.use(passport.session());

app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

/* 
	Get all the posts
	TODO: Get last 20 + pagination 
*/
app.get('/post', routes.posts.list);

/* 
	Get an existing post. Require id 
*/
app.get('/post/:url', routes.posts.read);

/* 
	Create a new post
*/
app.post('/post', authentication.userIsAuthenticated, routes.posts.create);

/* 
	Update an existing post. Require id + authentication
*/
app.put('/post', authentication.userIsAuthenticated, routes.posts.update);

/* 
	Delete an existing post. Require id + authentication
*/
app.delete('/post/:id', authentication.userIsAuthenticated, routes.posts.delete);

/*
	Get posts by tag
*/
app.get('/tag/:tagName', routes.posts.listByTag);

/*
	Login
*/
app.post('/login', routes.users.login);

/*
	Logout
*/
app.get('/logout', authentication.userIsAuthenticated, routes.users.logout);

console.log('Blog API is starting on port 3001');
app.listen(3001);
