var db = require('../config');
var Click = require('./click');
var User = require('./user');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  clicks: function() {
    return this.hasMany(Click);
  },
  user_id: function() {
    return this.belongsTo(User);
  },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var cipher = Promise.promisify(bcrypt.hash);
      return cipher(this.get('url'), null, null)
        .bind(this)
        .then(function(hash){
          this.set('code', hash.slice(0,10));
        });
    });
  }
});

module.exports = Link;
