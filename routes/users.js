var express = require('express');
var router = express.Router();
var m = require('../models/models.js');


// TODO: user page
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/login', function(req, res, next){
    m.User.findOne({
        where:{ username: req.body["username"] }
    }).then(function(user) {
        if(user && user.authenticate(req.body["password"])) {
            req.session.user_id = user.id;
            req.session.username = user.username;
            res.redirect('back');
        } else {
            req.flash('error', 'Failed to login');
            res.redirect(400, 'back');
        }
    });
});

router.post('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/');
});

router.get('/signup', function(req, res, next) {
    if (req.session.user_id){
        res.redirect('/');
    } else {
        res.render('signup');
    }
});

router.post('/signup', function(req, res, next) {
    m.User.create({
        username: req.body["username"],
        password: req.body["password"],
        email: req.body["email"]
    }).then(function(user) {
        req.session.user_id = user.id;
        req.session.username = user.username;
        res.redirect('/');
    }).catch(function(error) {
        req.flash('error', error.message);
        res.redirect(400, 'back');
    });
});


router.get('/friends', function(req, res, next) {
    m.Friend.findAll({
        where: {user_id: req.session.user_id, status: {$ne: 'declined'}},
        include: [m.Friend.associations.friend_user]
    }).then(function(friends){
        res.render('friend', {friends: friends});
    });
});

router.post('/friends', function(req, res, next) {
  if('username' in req.body) {
    m.User.findOne({where: {username: req.body["username"]}}).then(function(friend_user){
      m.Friend.bulkCreate([
        {user_id: req.session.user_id, friend_id: friend_user.id, status: 'waiting'},
        {user_id: friend_user.id, friend_id: req.session.user_id, status: 'request'},
      ]).then(function(requests) {
          res.redirect('back');
      }).catch(function(error) {
          req.flash('error', error.message);
          res.redirect(400, 'back');
      });
    }).catch(function(error) {
        req.flash('error', error.message);
        res.redirect(400, 'back');
    });
  } else {
    m.Friend.update({status: req.body['action']}, {
      where: {$or: [
        {user_id: req.session.user_id, friend_id: req.body["user_id"]},
        {user_id: req.body["user_id"], friend_id: req.session.user_id}
      ]}
    }).then(function(request) {
      res.redirect('back');
    });
  }
});

router.get('/profile', function(req,res,next){
    m.User.findOne({
        where: {id: req.session.user_id}
    }).then(function(user){
        res.render('signup',{user : user});
    });
});

router.post('/profile', function(req,res,next){
    m.User.findOne({
        where: {id: req.session.user_id}
    }).then(function(user) {
        user.password = req.body.password;
        user.email = req.body.email;
        user.save().then(function(update){
            res.redirect('/');
        });
    }).catch(function(error) {
        req.flash('error', error.message);
        res.redirect(400, 'back');
    });
});

router.get('/:username', function (req, res, next) {
    m.User.findOne({
        where: {username: req.params.username}
    }).then(function (user) {
        function render(memes) {
            memes = memes.map(function (m) {
                m.user=user;
                return m;
            });
            res.render('index', {title: user.username + '의', user: user, memes: memes});
        }

        var opts = {include: [m.Meme.associations.attachment]};
        if (user.id == req.session.user_id) {
            user.getMemes(opts).then(render);
        } else {
            opts.where = {$or: [{privacy_level: 'public'}]};
            if (req.session.user_id) {
                m.Friend.findOne({
                    where: {
                        user_id: user.id,
                        friend_id: req.session.user_id,
                        status: "accepted"
                    }
                }).then(function (f) {
                    if (f) {
                        opts.where.$or.push({privacy_level: 'friends'});
                    }
                    user.getMemes(opts).then(render);
                });
            } else {
                user.getMemes(opts).then(render);
            }
        }
    });
});

module.exports = router;
