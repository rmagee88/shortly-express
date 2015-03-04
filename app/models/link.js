var db = require('../config');
var Click = require('./click');
var User = require('./user');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

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
      // change to create unique ones for each user, needs a salt in the hash
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));

      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
