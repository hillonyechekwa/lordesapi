const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    lng: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})

const Location = new mongoose.model('location', locationSchema);
module.exports = Location;
