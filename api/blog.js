var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser = require('body-parser'); //bodyparser + json + urlencoder
var morgan  = require('morgan'); // logger
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');

app.listen(3001);
app.use(bodyParser());
app.use(morgan());

//Routes
var routes = {};
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');
routes.rss = require('./route/rss.js');


app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

//Get all published post
app.get('/post', routes.posts.list);

//Get all posts
app.get('/post/all', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.listAll);

//Get the post id
app.get('/post/:id', routes.posts.read); 

//Like the post id
app.post('/post/like', routes.posts.like);

//Unlike the post id
app.post('/post/unlike', routes.posts.unlike);

//Get posts by tag
app.get('/tag/:tagName', routes.posts.listByTag); 

//Create a new user
app.post('/user/register', routes.users.register); 

//Login
app.post('/user/signin', routes.users.signin); 

//Logout
app.get('/user/logout', jwt({secret: secret.secretToken}), routes.users.logout); 

//Create a new post
app.post('/post', jwt({secret: secret.secretToken}), tokenManager.verifyToken , routes.posts.create); 

//Edit the post id
app.put('/post', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.update); 

//Delete the post id
app.delete('/post/:id', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.delete); 

//Serve the rss feed
app.get('/rss', routes.rss.index);

console.log('Blog API is starting on port 3001');