const mongoose = require("mongoose");
const userSchema = require("./user").userSchema;
//create course schema
const courseSchema = new mongoose.Schema({
    courseName: String,
    sectionName: String,
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //number is instructor id - we never made any functionality for multiple instructors, 
    //so it will remain as one and not an array - MK
    studentList: Array, //array of ids
    assignmentList: Array, //array of ids
    courseCode: String
});

//course collection
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;