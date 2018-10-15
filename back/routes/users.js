const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../modules/users');
var   multer = require('multer');
const fs = require('fs');
const path = require('path');

// start path to save images & rename images
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, 'user-images/')
  },
  filename: function(req, file, cd){
    let username = req.body.username
      cd(null, username.replace(/\s+/g,"-") + "-" + Date.now() + path.extname(file.originalname));
  }
})// end path to save images & rename images

// start handel multer file size and use check file type fun
const upload = multer({
   storage:storage,
   limits: {fileSize: 10000000,},
   fileFilter: function(req, file, cb){
     checkFileType(file, cb);
   }
}).single('userImage') // end handel multer file size and use check file type fun

// start check file type 
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname   = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype  = filetypes.test(file.mimetype)
  if(mimetype && extname){
    return cb(null, true);
  } else{
    cb('Error: must be image');

  }
} // end check file type 
// to varfay user


router.post('/login', (req, res, next) => {
    const user = req.body.user;
    const password = req.body.password;
    if (user.includes('@')) {
      User.getUserByEmail(user, (err, user) => {
        if(err) throw err;
        if(!user) {
          return res.json({success: false, errMSG: 'Email not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
          if(err) {
          return  res.json({success: false, errMSG: 'somthig wrong  plz try agean later'})
          }
          if(isMatch) {
            const token = jwt.sign({data: user}, config.secret, {
              expiresIn: 604800 // 1 week
            });
            res.json({
              success: true,
              token: 'JWT '+ token,
              user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                image:user.image
              }// end user
            }) // end res.json
          } else {
            return res.json({success: false, errMSG: 'Wrong password'});
          }// end else
        }); // end User.comparePassword
      }); // end User.getUserByUsername
    }else{
      User.getUserByUsername(user, (err, user) => {
        if(err) throw err;
        if(!user) {
          return res.json({success: false, errMSG: 'User not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
          if(err) {
          return  res.json({success: false, errMSG: 'somthig wrong  plz try agean later'})
          }
          if(isMatch) {
            const token = jwt.sign({data: user}, config.secret, {
              expiresIn: 604800 // 1 week
            });
            res.json({
              success: true,
              token: 'JWT '+ token,
              user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                image:user.image
              }// end user
            }) // end res.json
          } else {
            return res.json({success: false, errMSG: 'Wrong password'});
          }// end else
        }); // end User.comparePassword
      }); // end User.getUserByUsername
    } // get user by user name

  }); 
// registry  
router.post('/register', (req, res, next)=>{
  upload(req, res, (err) => {
    if(err instanceof multer.MulterError)  {
      return  res.json({success:false, errMSG: err.message});
    } else{
       var  password    = req.body.password,
            email       = req.body.email,
            image       = req.file.filename,
            dateOfBirth = req.body.dateOfBirth,
            username    = req.body.username,
            newUser     = new User({
            username    :username,
            password    :password,
            email       :email,
            image       :image,
            dateOfBirth :dateOfBirth
        });
      User.findOne({"email":email}, (err, user)=>{
        if (err) {
          res.json({success: false, errMSG:err.message})
        }
        if(user){
          res.json({success: false, errMSG:'this email is alredy taken'});
          return false;
        }
        if(!user){
          User.findOne({"username":req.body.username}, (err, user)=>{
            if (err) {
              res.json({success: false, errMSG:err.message})
            }
            if(user){
              res.json({success: false, errMSG:'this username is alredy taken'})
            }
            if(!user){
              User.addUser(newUser, (err)=>{
                if (err) {
                    res.json({errMSG:err.message})
                }else{
                  res.json({success: true, MSG:'now you can login'})
                }
              }) // User addUser
            }
          }) //User findOne
        } // if ! user
      }) //user find one
      } //else
    }) // upload
  })// end user post

// profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
});// profile

// find users by id
router.get('/:id', (req, res, next)=>{
  var id = req.params.id;
  User.findById(id, (err, user)=>{
    if (err) {
      res.json({success:false, errMSG:err.message})
    }else{
        let data = {
          createdAt                : user.createdAt,
          dateOfBirth              : user.dateOfBirth,
          email                    : user.email,
          friends                  : user.friends,
          image                    : user.image,
          username                 : user.username,
          _id                      : user._id,
          holdAcceptFriendRequest  : user.holdAcceptFriendRequest,
          friendRequest            : user.friendRequest
        }
        res.json({success:true, user:data})
      }
  })
})// find by id 

// send friend request to user
router.post('/:id/addToFriends', (req, res, next)=>{
  var userId   = req.params.id,
      friendId = req.body.freindRequest;
  User.find({}, (err, users)=>{
    if (err) {
      res.json({success:false, errMSG:err.message})
    }else{
      var user     = users.find((user)=>{return user._id == userId})
      var friend = users.find((user)=>{return user._id == friendId})
      if (user) {
        var friendRequest = [] = user.friendRequest;
        var allReadyFriend = friendRequest.find((item)=>{return item === friendId})
        if (!allReadyFriend) {
          user.friendRequest.push(friendId)
          user.save((err)=>{
            if (err) {
              res.json({success:false, errMSG:err.message})
            }else{
              if(friend){
                var holdAcceptFriendRequest = [] = friend.holdAcceptFriendRequest;
                var allReadyUser = holdAcceptFriendRequest.find((item)=>{return item === userId})
                if(!allReadyUser){
                  friend.holdAcceptFriendRequest.push(userId)
                  friend.save((err)=>{
                    if (err) {
                      res.json({success:false, errMSG:err.message})
                    }else{
                      res.json({success:true, MSG:"request sended"})
                    }
                  }) //friend save
                } // if ! all Ready User
                if (allReadyUser) {
                  res.json({success:true, MSG:"this request is sended befor"})
                }
              } // if
            } // else
          }) //user save
        } // if
        if (allReadyFriend) {
          res.json({success:true, MSG:"this request is sended befor"})
        }
      } // if user
    }// else
  })// find
})




module.exports = router;


