const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'admin'
    }
});

adminSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('Admin', adminSchema);