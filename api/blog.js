var express = require('express')
    , app = express()
    , jwt = require('express-jwt')
    , db = require('./config/database')
    , secret = require('./config/secret');


//Route
var routes = {};
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.logger());

app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

/* 
    Get all published posts 
*/
app.get('/post', routes.posts.list);
/* 
    Get all posts 
*/
app.get('/post/all', jwt({secret: secret.secretToken}), routes.posts.listAll);

/* 
    Get an existing post. Require url
*/
app.get('/post/:id', routes.posts.read);

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
app.get('/logout', jwt({secret: secret.secretToken}), routes.users.logout);


/* 
    Create a new post. Require data
*/
app.post('/post', jwt({secret: secret.secretToken}), routes.posts.create);

/* 
    Update an existing post. Require id
*/
app.put('/post', jwt({secret: secret.secretToken}), routes.posts.update);

/* 
    Delete an existing post. Require id
*/
app.delete('/post/:id', jwt({secret: secret.secretToken}), routes.posts.delete);



console.log('Blog API is starting on port 3001');
app.listen(3001);
