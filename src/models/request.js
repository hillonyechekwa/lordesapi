const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true
    }
},{timestamps: true})

const Request = new mongoose.model("Request", RequestSchema);

module.exports = Request;