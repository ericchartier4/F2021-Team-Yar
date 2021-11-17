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


const  ObjectId = require('mongodb').ObjectId; // constent allows us to make our own object id's -elc
const userSchema = new mongoose.Schema ({
    _id : mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    listOfCourses: Array,
    isInstructor: Boolean
});
// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);

//create course schema
const courseSchema = new mongoose.Schema ({
    _id : mongoose.Schema.Types.ObjectId,
    courseName: String,
    sectionName: String,
    instructor:mongoose.Schema.Types.ObjectId, //number is instructor id - we never made any functionality for multiple instructors, 
                        //so it will remain as one and not an array - MK
    studentList: Array, //array of ids
    assignmentList: Array, //array of ids
    courseCode: String
});

//create assignment schema
const assignmentSchema = new mongoose.Schema ({
    _id : mongoose.Schema.Types.ObjectId,
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
        _id: ObjectId("111111111111111111111111"),
        username: "studA",
        password: "a",
        listOfCourses: [ ObjectId("111111111111111111111111"), ObjectId("111111111111111111111112"), ObjectId("111111111111111111111113"), ObjectId("111111111111111111111114"),ObjectId("111111111111111111111115")],
        isInstructor: false,
    },
    {
        _id: ObjectId("111111111111111111111112") ,
        username: "studB",
        password: "a",
        listOfCourses: [ ObjectId("111111111111111111111111"),  ObjectId("111111111111111111111113"),  ObjectId("111111111111111111111115")],
        isInstructor: false,
    },
    {
        _id: ObjectId("111111111111111111111113") ,
        username: "instrucA",
        password: "a",
        listOfCourses: [ ObjectId("111111111111111111111111"), ObjectId("111111111111111111111112"), ObjectId("111111111111111111111113")],
        isInstructor: true,
    },
    {
        _id: ObjectId("111111111111111111111114") ,
        username: "instrucB",
        password: "a",
        listOfCourses: [ ObjectId("111111111111111111111114"),  ObjectId("111111111111111111111115")],
        isInstructor: true,
    }
]);

Course.insertMany([
    {
        _id: ObjectId("111111111111111111111111") ,
        courseName: "ENSE 374",
        sectionName: "001",
        instructor:  ObjectId("111111111111111111111113"), 
        studentList: [ ObjectId("111111111111111111111111"),  ObjectId("111111111111111111111112")],
        assignmentList: [ ObjectId("111111111111111111111111"), ObjectId("111111111111111111111112")],
        courseCode: "XYAK2314"
    },
    {
        _id: ObjectId("111111111111111111111112") ,
        courseName: "ENEL 384",
        sectionName: "001",
        instructor:  ObjectId("111111111111111111111113"), 
        studentList: [ ObjectId("111111111111111111111111")],
        assignmentList: [ ObjectId("111111111111111111111113"), ObjectId("111111111111111111111114")],
        courseCode: "ABCD1234"
    },
    {
        _id: ObjectId("111111111111111111111113") ,
        courseName: "ENSE 352",
        sectionName: "001",
        instructor:  ObjectId("111111111111111111111113"), 
        studentList: [ObjectId("111111111111111111111111"),ObjectId("111111111111111111111112")],
        assignmentList: [ObjectId("111111111111111111111115"),ObjectId("111111111111111111111116")],
        courseCode: "EFGH5678"
    },
    {
        _id: ObjectId("111111111111111111111114") ,
        courseName: "CS 215",
        sectionName: "001",
        instructor: ObjectId("111111111111111111111114"), 
        studentList: [ObjectId("111111111111111111111111")],
        assignmentList: [ObjectId("111111111111111111111117"),ObjectId("111111111111111111111118")],
        courseCode: "IJKL2138"
    },
    {
        _id: ObjectId("111111111111111111111115") ,
        courseName: "CS 340",
        sectionName: "001",
        instructor: ObjectId("111111111111111111111114"), 
        studentList: [ObjectId("111111111111111111111111"),ObjectId("111111111111111111111112")],
        assignmentList: [ObjectId("111111111111111111111119"),ObjectId("111111111111111111111110")],
        courseCode: "MNOP3257"
    }
]);

Assignment.insertMany([
    {
        _id: ObjectId("111111111111111111111111") ,
        assignmentName: "Assignment 1",
        dueDate: "2021/11/17",
        dueTime: "14:00",
    },
    {
        _id: ObjectId("111111111111111111111112") ,
        assignmentName: "Assignment 2",
        dueDate: "2021/11/24",
        dueTime: "15:00",
    },
    {
        _id: ObjectId("111111111111111111111113") ,
        assignmentName: "Assign #1",
        dueDate: "2021/11/19",
        dueTime: "23:59",
    },
    {
        _id: ObjectId("111111111111111111111114") ,
        assignmentName: "Assign #2",
        dueDate: "2021/11/30",
        dueTime: "23:59",
    },
    {
        _id: ObjectId("111111111111111111111115") ,
        assignmentName: "Ass. 1",
        dueDate: "2021/12/01",
        dueTime: "13:00",
    },
    {
        _id: ObjectId("111111111111111111111116") ,
        assignmentName: "Ass. 2",
        dueDate: "2021/12/03",
        dueTime: "09:00",
    },
    {
        _id: ObjectId("111111111111111111111117") ,
        assignmentName: "Assignment 1",
        dueDate: "2021/11/15",
        dueTime: "12:00",
    },
    {
        _id: ObjectId("111111111111111111111118") ,
        assignmentName: "Assignment 2",
        dueDate: "2021/11/25",
        dueTime: "08:30",
    },
    {
        _id: ObjectId("111111111111111111111119") ,
        assignmentName: "Assignment 1",
        dueDate: "2021/11/23",
        dueTime: "10:30",
    },
    {
        _id: ObjectId("111111111111111111111110") ,
        assignmentName: "Assignment 2",
        dueDate: "2021/11/29",
        dueTime: "15:45",
    }
]);