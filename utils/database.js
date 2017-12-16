var Sequelize = require('sequelize');
var db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/meme', {
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

module.exports = db;
