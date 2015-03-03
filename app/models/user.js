var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  links: function() {
    return this.hasMany(Link);
  },
  initialize: function(password) {
    this.on('creating', function(model, attr, options){
      var shasum = crypto.createHash('sha1');
      shasum.update('test');//model.get(password));
      model.set('password', shasum.digest('hex'));
    });
  }

});

module.exports = User;
