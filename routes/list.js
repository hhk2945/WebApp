var express = require('express');
var router = express.Router();
var m = require('../models/models.js');
var redis = require('../utils/redis');
var es = require('../utils/elasticsearch.js');

const pageLimit = 20;

router.get('/', function(req, res, next) {
    var page = parseInt(req.query.page || '1');
    if(req.session.user_id) {
        m.Friend.findValidFriendIdsByUserId(req.session.user_id, function(friends_ids){
            friends_ids.push(req.session.user_id);
            m.Meme.findAndCountAll({
                include: [m.Meme.associations.attachment, m.Meme.associations.user],
                where: {
                    $or: [
                        {privacy_level: 'public'},
                        {privacy_level: 'private', user_id: req.session.user_id},
                        {privacy_level: 'friends', user_id: {$in: friends_ids}}
                    ]
                },
                order: 'id DESC',
                limit: pageLimit,
                offset: ((page - 1) * pageLimit)
            }).then(function(result) {
                res.render('index', {
                  memes: result.rows,
                  total: result.count,
                  page: page,
                  limit: pageLimit
                });
            });
        });
    } else{
        m.Meme.findAndCountAll({
            include: [m.Meme.associations.attachment, m.Meme.associations.user],
            where: {
                privacy_level: 'public'
            },
            limit: pageLimit,
            offset: ((page - 1) * pageLimit)
        }).then(function(result) {
            res.render('index', {
                memes: result.rows,
                total: result.count,
                page: page,
                limit: pageLimit
            });
        });
    }
});

router.get('/trending', function (req, res, next) {
    var page = parseInt(req.query.page || '1');
    redis.zcard('trending', function (err, count) {
        redis.zrevrange('trending', ((page - 1)*pageLimit), (page*pageLimit)-1, function (err, memeIds) {
            if (err) {
                res.send(500);
            } else {
                m.Meme.findAll({
                    where: { id:{ $in : memeIds } },
                    include: [m.Meme.associations.attachment, m.Meme.associations.user]
                }).then(function (memes) {
                    var sortedMemes = memeIds.map(function(id) {
                        var i = memes.findIndex(function(meme){
                            return meme.id == id;
                        });
                        return memes.splice(i, 1).pop();
                    });
                    res.render('index', { memes: sortedMemes, total: count, page: page, limit: pageLimit });
                });
            }
        });
    });
});

router.get('/search', function(req, res, next) {
    var page = parseInt(req.query.page || '1');
    var query = {
      query: { match: { description: req.query.q }},
      filter: {
        or: [
          { term: { privacy_level: 'public'}}
        ]
      }
    };
    function executeQueryAndRender() {
        es.search({
            index: 'meme',
            type: 'meme',
            body: query,
            from: ((page - 1) * pageLimit),
            size: pageLimit
        }, function(err, resp) {
            if (err) {
                res.send(500);
            } else {
                memes_id = resp.hits.hits.map(function(meme) {
                    return Number(meme._id);
                });
                m.Meme.findAll({
                    include: [m.Meme.associations.attachment, m.Meme.associations.user],
                    where: {
                        id: {$in: memes_id}
                    }
                }).then(function (memes) {
                    res.render('index', {memes: memes, total: resp.hits.total , page: page, limit: pageLimit});
                });
            }
        });
    }
    if (req.session.user_id) {
        m.Friend.findValidFriendIdsByUserId(req.session.user_id, function(friends_ids) {
            friends_ids.push(req.session.user_id);
            query.filter.or.push({and: [
              {term: {privacy_level: 'friends'}},
              {terms: {user_id: friends_ids }}
            ]});
            query.filter.or.push({and: [
              {term: {privacy_level: 'private'}},
              {term: {user_id: req.session.user_id }}
            ]});
            executeQueryAndRender();
        });
    } else {
        executeQueryAndRender();
    }
});

module.exports = router;
