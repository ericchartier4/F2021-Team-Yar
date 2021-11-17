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
    instructor: mongoose.Schema.Types.ObjectId, //number is instructor id - we never made any functionality for multiple instructors, 
                        //so it will remain as one and not an array - MK
    studentList: Array, //array of ids
    assignmentList: Array, //array of ids
    courseCode: String
});

//create assignment schema
const assignmentSchema = new mongoose.Schema ({
    _id : mongoose.Schema.Types.ObjectId,
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
    

    let sundayDate = new Date("2021/11/15");
    let dayofWeek = sundayDate.getDay(); // will be 0 = sunday , monday =1... 
    sundayDate.setDate(sundayDate.getDate()-dayofWeek);
    sundayDate.setHours(0);
    sundayDate.setMinutes(0);
    sundayDate.setSeconds(0);
    sundayDate.setMilliseconds(0);
    let saturdayDate = sundayDate;
    saturdayDate.setDate(saturdayDate.getDate()+6);
    let endDate = saturdayDate;
    endDate.setDate(endDate.getDate()+1);
    let userClassList = await User.findOne({username:"instrucB"});
    userClassList= userClassList["listOfCourses"];
    console.log(userClassList);
   for (let i of userClassList)
   {
        let assignmentListHolder = await Course.findOne({_id: i });
        assignmentListHolder = assignmentListHolder["assignmentList"];
        for (let j of assignmentListHolder)
        {
            let assignmentHolder = await Assignment.findOne({_id:j});
            let dateHolder = assignmentHolder["dueDate"];
            dateHolder = dateHolder
            dateHolder = new Date(dateHolder);
            
            if (dateHolder.getTime()>=sundayDate.getDate()&& dateHolder.getTime() <= endDate.getTime())
            {
                console.log(dateHolder.toDateString());
            }
        }
   }
    console.log ("user attempting to access calender")
    res.render("calendar"); 
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
    console.log("user accessed the add assignment page");
    res.render("addassignment");

});

app.post("/addassignment", async( req, res ) => {
    //MOSTLY DONE - NEED A WAY TO KNOW FOR SURE WHICH CLASS TO ADD TO
    
    console.log(req.body);
    const results = await Assignment.find();
    const assignment = new Assignment({
        _id: results.length+1,
        assignmentName: req.body.assignName,
        dueDate: req.body.dueDate,
        dueTime: req.body.dueTime,
    })
    assignment.save();
    courseId = parseInt(req.body.courseId);
    await Course.updateOne({_id: courseId}, 
        {
           $push: {assignmentList: results.length+1}
        });

    res.redirect("/calendar");
});

app.get( "/editassignment", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the edit assignment page");
    res.render("editassignment");
    //will need to pass variables to display which assignment is being edited
});

app.post( "/editassignment", async( req, res ) => {
    console.log(req.body);
    //will need to know which assignment is being edited
    //update assignment with info from req.body

});

app.get( "/addcourse", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the add course page");
    res.render("addcourse");
});

app.post( "/addcourse", async( req, res ) => {
    console.log(req.body);
    // const results = await Assignment.find();
    // const course = new Course({
    //     _id: 5,
    //     courseName: "CS 340",
    //     sectionName: "001",
    //     instructor: 4, 
    //     studentList: [],
    //     assignmentList: [],
    //     courseCode: "MNOP3257"
    // })
    // course.save();
    res.redirect("/calendar");
});

app.get( "/joincourse", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the join course page");
    res.render("joincourse");
});

 app.get( "/nextweek", async( req, res ) => {
    // will take the date ( or sunday date) , and offset by -7 day and return to render calander with new date. -Elc  
 });

 app.get( "/lastweek", async( req, res ) => {
    // will take the date ( or sunday date) , and offset by +7 day and return to render calander with new date. -Elc  
 
 });

 
