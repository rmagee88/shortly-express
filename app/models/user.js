var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
var Link = require('./link');
Promise.promisifyAll(bcrypt);

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
  initialize: function() {},
  hashPassword: function() {
    model = this;
    return bcrypt.hashAsync(model.get('password'), null, null).then(function(hash) {
      model.set('password', hash);
      return model;
    });
  },

  checkPassword: function(password){
    return bcrypt.compareAsync(password, this.get('password')).then(function(res){
      return res;
    });
  }
});

module.exports = User;
