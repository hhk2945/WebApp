var Sequelize = require('sequelize');
var db = require('../utils/database.js');

var Friend = db.define('friend', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: Sequelize.INTEGER,
    friend_id: Sequelize.INTEGER,
    status: Sequelize.ENUM('waiting', 'request', 'decliend', 'accepted')
}, {
    underscored: true,
    classMethods: {
        findValidFriendIdsByUserId: function(user_id, callback) {
            Friend.findAll({
                attributes: ['friend_id'],
                where: {
                    user_id: user_id, status: "accepted"
                }
            }).then(function(friends) {
                callback(friends.map(function(friend) { return friend.friend_id }));
            });
        }
    }
});

module.exports = Friend;
