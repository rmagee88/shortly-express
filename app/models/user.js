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
      bcrypt.genSalt(10, function(err, salt) {
        if(err) {
          console.log("bcrypt error ", err);
        }
        bcrypt.hash(model.get('password'), salt, null, function(err, hash) {
          console.log("bcrypt hash error ", err);
          model.set('password', hash);
        });
      });

      // var shasum = crypto.createHash('sha1');
      // shasum.update(model.get('password'));
      // model.set('password', shasum.digest('hex'));
    });
  },
  checkPassword: function(password){
    return bcrypt.compare(password, model.get('password'), function(err, res){
      return res;
    });
  }

});

module.exports = User;
