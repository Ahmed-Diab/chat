const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notifications =  mongoose.Schema({
  username:{ 
    type:String,
    required:[true ,'plz fill all fildes']
  },
  userImage:{
    type:String,
    required:[true ,'plz fill all fildes']
  },
  body:{
    type:String,
    required:[true ,'plz fill all fildes']
  }
})

var newUser = mongoose.Schema({
    username:{ 
        type:String,
        required:[true ,'plz fill all fildes']
    },
    image:{
      type:String,
      required:[true ,'plz fill all fildes']
    },
    password:{
        type:String,
        required:[true ,'plz fill all fildes']
    },
    email:{
        type:String,
        required:[true ,'plz fill all fildes']
    },
    friends:{
      type:Array
    },
    holdAcceptFriendRequest:{
      type:Array
    },
    friendRequest:{
      type:Array
    },
    createdAt: { 
      type: Date, 
      default: Date.now
     },
     notifications:[notifications]
});

const User = module.exports = mongoose.model('User', newUser);
module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
  }
module.exports.getUserByUsername = function(username, callback) {
  const query = {username: username}
  User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback) {
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}
module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}