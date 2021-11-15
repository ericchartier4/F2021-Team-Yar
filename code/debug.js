//inserts testing values into the database.
//user studA is in classes 1,2,3,4,5
//user studB is in classes 1,3,5
//user instrucA teaches classes 1,2,3
//instrucB teaches classes 4 and 5
//passwords for all users is just "a" for simplicity for now
//each class has 2 assignments
//the date format is yyyy-mm-dd
//time is in 24h format
//MK

const express  = require( "express" );
const mongoose = require( "mongoose" );

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();

const app = express(); 
app.use(express.static("public"));
// a common localhost test port
const port = 3000; 

// body-parser is now built into express!
app.use( express.urlencoded( { extended: true} ) ); 

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use (passport.initialize());
app.use (passport.session());

app.set( "view engine", "ejs" );

// connect to mongoose on port 27017
mongoose.connect( 'mongodb://localhost:27017/taskmaster', 
                 { useNewUrlParser: true, useUnifiedTopology: true });

//create user schema
const userSchema = new mongoose.Schema ({
    _id: Number,
    username: String,
    password: String,
    listOfCourses: Array,
    isInstructor: Boolean
});
// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);

//create course schema
const courseSchema = new mongoose.Schema ({
    _id: Number,
    courseName: String,
    sectionName: String,
    instructor: Number, //number is instructor id - we never made any functionality for multiple instructors, 
                        //so it will remain as one and not an array - MK
    studentList: Array, //array of ids
    assignmentList: Array, //array of ids
    courseCode: String
});

//create assignment schema
const assignmentSchema = new mongoose.Schema ({
    _id: Number,
    assignmentName: String,
    dueDate: String,
    dueTime: String
});

//users collection
const User = mongoose.model ( "User", userSchema );

//course collection
const Course = mongoose.model ( "Course", courseSchema );

//assignment collection
const Assignment = mongoose.model ( "Assignment", assignmentSchema );

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

User.insertMany([
    {
        _id: 1,
        username: "studA",
        password: "a",
        listOfCourses: [1,2,3,4,5],
        isInstructor: false,
    },
    {
        _id: 2,
        username: "studB",
        password: "a",
        listOfCourses: [1,3,5],
        isInstructor: false,
    },
    {
        _id: 3,
        username: "instrucA",
        password: "a",
        listOfCourses: [1,2,3],
        isInstructor: true,
    },
    {
        _id: 4,
        username: "instrucB",
        password: "a",
        listOfCourses: [4,5],
        isInstructor: true,
    }
]);

Course.insertMany([
    {
        _id: 1,
        courseName: "ENSE 374",
        sectionName: "001",
        instructor: 3, 
        studentList: [1,2],
        assignmentList: [1,2],
        courseCode: "XYAK2314"
    },
    {
        _id: 2,
        courseName: "ENEL 384",
        sectionName: "001",
        instructor: 3, 
        studentList: [1],
        assignmentList: [3,4],
        courseCode: "ABCD1234"
    },
    {
        _id: 3,
        courseName: "ENSE 352",
        sectionName: "001",
        instructor: 3, 
        studentList: [1,2],
        assignmentList: [5,6],
        courseCode: "EFGH5678"
    },
    {
        _id: 4,
        courseName: "CS 215",
        sectionName: "001",
        instructor: 4, 
        studentList: [1],
        assignmentList: [7,8],
        courseCode: "IJKL2138"
    },
    {
        _id: 5,
        courseName: "CS 340",
        sectionName: "001",
        instructor: 4, 
        studentList: [1,2],
        assignmentList: [9,10],
        courseCode: "MNOP3257"
    }
]);

Assignment.insertMany([
    {
        _id: 1,
        assignmentName: "Assignment 1",
        dueDate: "2021-11-17",
        dueTime: "14:00",
    },
    {
        _id: 2,
        assignmentName: "Assignment 2",
        dueDate: "2021-11-24",
        dueTime: "15:00",
    },
    {
        _id: 3,
        assignmentName: "Assign #1",
        dueDate: "2021-11-19",
        dueTime: "23:59",
    },
    {
        _id: 4,
        assignmentName: "Assign #2",
        dueDate: "2021-11-30",
        dueTime: "23:59",
    },
    {
        _id: 5,
        assignmentName: "Ass. 1",
        dueDate: "2021-12-01",
        dueTime: "13:00",
    },
    {
        _id: 6,
        assignmentName: "Ass. 2",
        dueDate: "2021-12-03",
        dueTime: "09:00",
    },
    {
        _id: 7,
        assignmentName: "Assignment 1",
        dueDate: "2021-11-15",
        dueTime: "12:00",
    },
    {
        _id: 8,
        assignmentName: "Assignment 2",
        dueDate: "2021-11-25",
        dueTime: "08:30",
    },
    {
        _id: 9,
        assignmentName: "Assignment 1",
        dueDate: "2021-11-23",
        dueTime: "10:30",
    },
    {
        _id: 10,
        assignmentName: "Assignment 2",
        dueDate: "2021-11-29",
        dueTime: "15:45",
    }
]);