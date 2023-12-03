const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    bio: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String,
        default: ''
    },
    recoveryToken: {
        type: String,
        default: ''
    },
    recoveryExpirationDate: {
        type: Date,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;