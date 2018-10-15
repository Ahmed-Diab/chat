const mongoose = require('mongoose');
var newMessage = mongoose.Schema({
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
});

const Message = module.exports = mongoose.model('Message', newMessage);

