var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var gravatar = require('gravatar');

var db = require('../utils/database.js');
var es = require('../utils/elasticsearch.js');

var User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  password: {
    type: Sequelize.STRING,
    set: function(val) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(val, salt);
      this.setDataValue('password', hash);
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {isEmail: true}
  }
}, {
  underscored: true,
  instanceMethods: {
    authenticate: function(value) {
      if (bcrypt.compareSync(value, this.password))
        return this;
      else
        return false;
    }, getProfileUrl: function() {
      return gravatar.url(this.email, {s: '100', r: 'x', d: 'retro'}, true);
    }
  }
});

User.addHook('afterCreate', 'saveES', function(user, options) {
  es.create({
    index: 'meme',
    type: 'user',
    id: user.id,
    body: {
      username: user.username,
      email: user.email
    }
  }, function(error, response) {
  });
});

User.addHook('afterUpdate', 'saveES', function(user, options) {
  es.update({
    index: 'meme',
    type: 'user',
    id: user.id,
    body: { doc: {
      username: user.username,
      email: user.email
    }}
  }, function(error, response) {
  });
});

User.addHook('afterDestroy', 'saveES', function(user, options) {
  es.delete({
    index: 'meme',
    type: 'user',
    id: user.id
  }, function(error, response) {
  });
});

module.exports = User;
