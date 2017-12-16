var m = {};
m.Friend = require('../models/friends.js');
m.Meme = require('../models/memes.js');
m.User = require('../models/users.js');
m.Attachment = require('../models/attachments.js');

m.Friend.belongsTo(m.User);
m.Friend.belongsTo(m.User, {as: 'friend_user', foreignKey: 'friend_id'});
m.Meme.belongsTo(m.User);
m.Meme.belongsTo(m.Attachment);
m.User.hasMany(m.Meme);
m.User.belongsToMany(m.User, {through: m.Friend, as: 'friends'});

module.exports = m;
