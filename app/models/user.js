var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
var Link = require('./link');
// promisify bcrypt?

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
        // return bcrypt & .then callback to set password (null for salt?)
        bcrypt.hash(model.get('password'), salt, null, function(err, hash) {
          console.log("bcrypt hash error ", err);
          console.log("hash", hash);
          console.log('hash type: ', typeof hash);
          model.set('password', hash);

        });

      });
    });
  }
  // ,
  // checkPassword: function(password){
  //   console.log(this.get('password'));
  //   bcrypt.compare(password, hash, function(err, res){
  //     console.log(res);
  //   });
  // }

});

module.exports = User;
