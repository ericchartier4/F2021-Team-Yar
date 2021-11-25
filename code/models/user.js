const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
//create user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    listOfCourses: Array,
    isInstructor: Boolean
});
// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);
//users collection
const User = mongoose.model("User", userSchema);
module.exports = {
    User,
    userSchema
};