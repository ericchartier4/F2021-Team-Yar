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
    dueDate: String, //I used the format yyyy-mm-dd -MK
    dueTime: String //24h format: 2:00 pm is 14:00 -MK
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


// Simple server operation
app.listen ( port, () => {
    // template literal
    console.log ( `Server is running on http://localhost:${port}` );
});

app.get( "/", ( req, res ) => {
    console.log( "A user is accessing the root route using get" );
    res.render("login"); //need login.ejs before this works. Also check, maybe it's case sensitive? - MK
});

//signup and login forms - Ify you might need 2 of /signup since the signup form for an instructor is different with the auth code
//I think /login should work for both since they're the same? Do whatever you need to -MK
app.post( "/signup", (req, res) => {
   
});

app.post( "/login", ( req, res ) => {
   
});

//Eric - I'm guessing you'll need async here to use await while you get the assignment data so that's why I left it there- feel free to 
//get rid of it if you aren't going to need it -MK
app.get( "/calendar", async( req, res ) => {
    console.log ("user attempting to access calender")

   //check if user is authenticated before rendering - will need to do this later on once login/signup is done

});

//in theory this one should already work - MK
app.get( "/logout", ( req, res ) => {
    console.log( "A user is logging out" );
    req.logout();
    res.redirect("/");
});

//Mackenzie's 4 pages
app.get( "/addassignment", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
 
 });

 app.get( "/editassignment", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
 
 });

 app.get( "/addcourse", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
 
 });

 app.get( "/joincourse", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
 
 });