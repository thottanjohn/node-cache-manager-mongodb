'use strict';

var MongoClient = require('mongodb').MongoClient,
  store = require('../index.js'),
  mongoUri = 'mongodb://127.0.0.1:27017/test',
  collection = 'test_node_cache_mongodb_1',
  collection2 = 'test_node_cache_mongodb_2',
  assert = require('assert');

describe('node-cache-manager-mongodb', function () {
  var db;
  var c, c2;
  var mongoC;

  before('connect to mongo', function (done) {
    MongoClient.connect(mongoUri, function (err, client) {
      mongoC = client;
      db = mongoC.db();
      c = db.collection(collection);
      c2 = db.collection(collection2);
      done(err);
    });
  });

  describe('set', function () {
    var s;
    before('connect', function (done) {
      s = store.create({
        uri: mongoUri,
        options: {
          collection: collection,
          ttl: 5
        }
      });
      setTimeout(function () {
        done();
      }, 500);
    });

    it('check mongo expiry', function (done) {
      this.timeout(5000);
      s.set('test-cookie-0', 'test-user', {
        ttl: 0.1
      }, function () {
        setTimeout(function () {
          c.findOne({
            key: 'test-cookie-0'
          }, function (e, r) {
            assert.equal(r, null);
            done(e);
          });
        }, 2000);
      });
    });

    it('value with 1s expiry', function (done) {
      s.set('test-cookie-1', 'test-user', {
        ttl: 1
      }, function () {
        s.get('test-cookie-1', function (e, v) {
          assert.equal(null, v);
          done(e);
        });
      });
    });

    it('check expiry', function (done) {
      this.timeout(5000);
      s.set('test-cookie-2', 'test-user', {
        ttl: 1
      }, function () {
        setTimeout(function () {
          s.get('test-cookie-2', function (e, v) {
            assert.equal(null, v);
            done(e);
          });
        }, 2000);
      });
    });

    it('check mongo expiry (this takes long)', function (done) {
      this.timeout(10000);
      s.set('test-cookie-3', 'test-user', {
        ttl: 1
      }, function () {
        setTimeout(function () {
          var c = db.collection(collection);
          c.findOne({
            key: 'test-cookie-3'
          }, function (e, r) {
            assert.equal(null, r);
            done(e);
          });
        }, 5000);
      });
    });

  });

  describe('create a second collection', function () {
    var s;
    before('connect', function (done) {
      s = store.create({
        uri: mongoUri,
        options: {
          collection: collection2
        }
      });
      setTimeout(function () {
        done();
      }, 500);
    });

    it('check expiry', function (done) {
      this.timeout(1000);
      s.set('test-cookie-2', 'test-user', {
        ttl: 0.1
      }, function () {
        setTimeout(function () {
          s.get('test-cookie-2', function (e, v) {
            assert.equal(null, v);
            done(e);
          });
        }, 200);
      });
    });

  });


  describe('get', function () {

  });


  after('close connection', function () {
    mongoC.close();
    process.exit(0);
  });
});
