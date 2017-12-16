var Sequelize = require('sequelize');
var db = require('../utils/database.js');
var es = require('../utils/elasticsearch.js');
var redis = require('../utils/redis.js');

var Meme = db.define('meme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: Sequelize.INTEGER,
    description: Sequelize.STRING,
    attachment_id: Sequelize.INTEGER,
    privacy_level: {
        type: Sequelize.ENUM('public', 'friends', 'private'),
        defaultValue: 'public'
    }
}, {
    underscored: true
});

Meme.addHook('afterCreate', 'saveES', function(meme, options) {
  es.create({
    index: 'meme',
    type: 'meme',
    id: meme.id,
    body: {
      user_id: meme.user_id,
      privacy_level: meme.privacy_level,
      description: meme.description
    }
  }, function(error, response) {
  });
});

Meme.addHook('afterBulkCreate', 'saveES', function(memes, options) {
  memes.forEach(function(meme){
    es.create({
      index: 'meme',
      type: 'meme',
      id: meme.id,
      body: {
        user_id: meme.user_id,
        privacy_level: meme.privacy_level,
        description: meme.description
      }
    }, function(error, response) {
    });
  });
});

Meme.addHook('afterUpdate', 'saveES', function(meme, options) {
  es.update({
    index: 'meme',
    type: 'meme',
    id: meme.id,
    body: { doc: {
      privacy_level: meme.privacy_level,
      description: meme.description
    }}
  }, function(error, response) {
  });
});

Meme.addHook('afterUpdate', 'updateTrending', function(meme, options) {
  if (meme.privacy_level != 'public') {
    var logger = function(err, reply) {
      if (err) {
        console.log(err);
      }
    };
    redis.del('meme:'+meme.id, logger);
    redis.zrem('trending', meme.id, logger);
  }
});

Meme.addHook('afterDestroy', 'saveES', function(meme, options) {
  es.delete({
    index: 'meme',
    type: 'meme',
    id: meme.id
  }, function(error, response) {
  });
});

Meme.addHook('afterDestroy', 'updateTrending', function(meme, options) {
  var logger = function(err, reply) {
    if (err) {
      console.log(err);
    }
  };
  redis.del('meme:'+meme.id, logger);
  redis.zrem('trending', meme.id, logger);
});

module.exports = Meme;
