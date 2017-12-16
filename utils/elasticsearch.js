var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_HOST || 'localhost:9200',
  log: 'trace'
});

module.exports = client;
