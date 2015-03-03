var express = require('express');
var _ = require('underscore');
var util = require('./lib/utility');
var partials = require('express-partials');
var sessions = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(sessions({secret: 'test'}));


app.get('/',
function(req, res) {
  // console.log('session object: ', req.session);
  console.log('/ username: ', req.session.username);
  if (!req.session.username) {
    res.redirect('/login');
  } else {
    res.render('index');
  }
});

app.get('/login', function(req, res) {
  console.log('/login username: ', req.session.username);
  util.checkUser(req, res, "/", 'login', 'redirect', 'render');
});

app.get('/logout', function(req, res) {
  console.log('/logout username: ', req.session.username);
  req.session.destroy(function() {
    res.redirect('/login');
  });
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/create',function(req, res) {

  if (!req.session.username) {
    res.redirect('/login');
  } else {
    res.render('index');
  }
});

app.get('/links', function(req, res) {

  if (!req.session.username) {
    res.redirect('/login');
  } else {
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
  }
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  console.log("username & password: ", username, password)

  Users
    .query('where', 'username', '=', username)
    .fetch()
    .then(function(result) {
      console.log(result.models[0].get('username'));
      console.log(result.models[0].get('password'));
      result.models[0].checkPassword(password).then(function(match){
        console.log("match: ", match);
        if (match) {
          req.session.regenerate(function(err) {
            if (err) console.log('session regenerate error: ', err);
            req.session.username = result.models[0].get('username');
            res.redirect('/');
          });

        } else {
          res.redirect('/login');
        }
      });
    });
});

app.post('/signup', function(req, res) {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;

  var user = new User({
    username: username,
    password: password
  });

  user.hashPassword().then(function(model) {
    model.save().then(function(newUser) {
      Users.add(newUser);
      console.log('saving user: ', newUser.get('username'));
      console.log('saving pword: ', newUser.get('password'));
      req.session.regenerate(function(err) {
        if (err) console.log('session regenerate error: ', err);
        req.session.username = newUser.get('username');
        res.redirect('/');
      });
    });
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    // console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      // console.log('new link attributes: ', found.attributes);
      res.send(200, found.attributes);
    } else {
      // console.log('link not found in db...');
      util.getUrlTitle(uri, function(err, title) {
        // console.log('title is: ', title);
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          // console.log('new link saved: ', newLink);
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
