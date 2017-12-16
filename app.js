var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var URI = require('URIjs');

var redis_client = require('./utils/redis.js');
var users = require('./routes/users');

var app = express();

app.use(session({
  store: new RedisStore({client: redis_client, ttl: 60*60*24}),
  secret: 'know your meme!',
}));
app.use(function(req,res,next){
  res.locals.session = req.session;
  res.locals.url_base = req.protocol + '://' + req.get('host');
  res.locals.urlHelper = function (key, value) {
      return (new URI(req.url)).setQuery(key, value);
  };
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/users', users);
require('./routes/index')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
