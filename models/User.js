const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    createdon: {type: Date, default: Date.now}
});

module.exports = {
    User: mongoose.model('User', userSchema)
};