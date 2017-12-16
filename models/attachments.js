var Sequelize = require('sequelize');
var db = require('../utils/database.js');

var Attachment = db.define('attachment', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filepath: {
    type: Sequelize.STRING,
    get: function(){
      return '/uploads/'+this.getDataValue('filepath');
    }
  },
  filesize: Sequelize.INTEGER,
}, {
  underscored: true,
  instanceMethods: {
  }
});

module.exports = Attachment;
