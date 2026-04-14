const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//requiring passport-local-mongoose
const passportLocalMongoose = require("passport-local-mongoose").default;
//define schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);