var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  defaults: {
    password: null,
    security_question: null,
    salt: null
  },
  links: function() {
    return this.hasMany(Link);
  },
  initialize: function() {
    this.on('creating', function(model, attr, options){
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('password'));
      model.set('password', shasum.digest('hex'));
    });
  }

});

module.exports = User;
