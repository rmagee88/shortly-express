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
  initialize: function() {
    // this.on('creating', function(model, attr, options){
    //   // return bcrypt & .then callback to set password (null for salt?)
    //   bcrypt.hashAsync(model.get('password'), null, null).then(function(hash) {
    //     // console.log("bcrypt hash error ", err);
    //     console.log("hash", hash);
    //     console.log('hash type: ', typeof hash);
    //     model.set('password', hash);
    //   });
    // });
  },
  hashPassword: function() {
    model = this;
    console.log("model :", model);
    return bcrypt.hashAsync(model.get('password'), null, null).then(function(hash) {
      // console.log("bcrypt hash error ", err);
      console.log("hash", hash);
      console.log('hash type: ', typeof hash);
      model.set('password', hash);
      return model;
    });
  },

  checkPassword: function(password){
    console.log(this.get('password'));
    return bcrypt.compareAsync(password, this.get('password')).then(function(res){
      console.log(res);
      return res;
    });
  }
});

module.exports = User;
