const mongoose = require('mongoose');

const chatMessages = mongoose.Schema({
    username:{
        type:String,
        required: [true, 'name is required']
    },
    body:{
        type:String,
        required: [true, 'message is required']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

var newMessage = mongoose.Schema({
    chatName:{
        type:String,
        required: [true, 'chatname is required']
    },
    chatMessages:[chatMessages]
});

const Message = module.exports = mongoose.model('Message', newMessage);

