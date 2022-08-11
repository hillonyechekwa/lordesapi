const mongoose = require('mongoose');

const UserSchema =  mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: {unique: true}
    },
    email: {
        type: String,
        required: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true,
        index: {unique: true}
    },
    bio:{
        type: String
    },
    role: {
        type: String,
        required: true
    },
   services: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Service'
   }],
   requestNotifs: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Request'
   }],
   requestNotifsCount: {
       type: Number,
       default: 0
   },
   acceptedReqs: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Request'
   }],
   acceptedReqsCount: {
       type: Number,
       default: 0
   }
},{timestamps: true})

const User = new mongoose.model('User', UserSchema);
module.exports = User;