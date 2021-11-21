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
    username: String,
    password: String,
    listOfCourses: Array,
    isInstructor: Boolean
});
// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);


//create course schema
const courseSchema = new mongoose.Schema ({
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


function isLessThan24HourStrings(  lessThan, moreThan) {
let result = false;

let [lessThanHours, lessThanMinutes] = lessThan.split(':');
let [moreThanHours, moreThanMinutes] = moreThan.split(':');
 
 if ( lessThanHours === moreThanHours && lessThanMinutes < moreThanMinutes)
{
    result = true ;
}
else if (lessThanHours < moreThanHours )
{
    result = true;
}

return result; 
};

function get12HourFrom24HourString(hourStringinput)
{
 let result;
 let [hour, minutes] = hourStringinput.split(':');
 if ( hour > 12 ){
     hour = hour - 12
     if ( hour === 12 || hour === 11 || hour === 10 )
     {
     result = hour.toString();
     result = result + ":" ;
     result = result + minutes;
     result = result + "PM";
     }
     else
     {
     result = "0"
     result = result + hour.toString();
     result = result + ":" ;
     result = result + minutes;
     result = result + "PM";
     }
     
}
 else 
 {
    
    result = hour.toString();
    result = result + ":" ;
    result = result + minutes;
    result = result + "AM";
 }
return result; 
}

function sortAssignmentsByDueDate(arrayInput)
{

    let arrayLength = 0 ;
    for ( let i in arrayInput)
     {
         arrayLength = arrayLength + 1;
     }
       for(let i =0 ; i < arrayLength  ; i++)
       {
         let smallest = i; 
         for (let j =i ; j < arrayLength  ; j++) 
         { 
             
             if ( isLessThan24HourStrings(arrayInput[j]["dueTime"],arrayInput[smallest]["dueTime"]) )
             {
                
                 smallest = j; 
                 
             }
         }
         let swap = arrayInput[i];
         arrayInput[i] = arrayInput[smallest];
         arrayInput[smallest] = swap;
         
         
       } 
  return arrayInput;
}



app.get( "/calendar", async( req, res ) => {  // wiil have to make these redirect to diffrent sub redirects , should not be too hard. 
    if (!req.session.calendarDatePointer) {  
        req.session.calendarDatePointer = new Date();
        req.session.calendarDatePointer.setHours(0);
        req.session.calendarDatePointer.setMinutes(0);
        req.session.calendarDatePointer.setSeconds(0);
        req.session.calendarDatePointer.setMilliseconds(0);
      }
      if (!req.session.instructorCoursePointer )
      {
         req.session.instructorCoursePointer ="Null";
      }

    let dayofWeek = req.session.calendarDatePointer.getDay(); // will be 0 = sunday , monday =1... 
    let sundayOfWeek = req.session.calendarDatePointer;
    sundayOfWeek.setDate(req.session.calendarDatePointer.getDate()-dayofWeek);
    let saturdayOfWeek = sundayOfWeek;
    saturdayOfWeek.setDate(saturdayOfWeek.getDate()+6);
    sundayOfNextWeek = saturdayOfWeek;
    sundayOfNextWeek.setDate(sundayOfNextWeek.getDate()+1);
    let courseListArray = await User.findOne({username:"instrucA"});
    courseListArray= courseListArray["listOfCourses"];
    let userCourses = [];  
    let userAssignments = []; 
    for (let i of courseListArray)
    {
    let viewSingleCourse = await Course.findOne({_id: i });
       userCourses.push(viewSingleCourse);
        viewSingleCourse= viewSingleCourse["assignmentList"];
        for (let j of viewSingleCourse)
        {
         let veiwSingleAssignment = await Assignment.findOne({_id:j});

         let assignmentDueDate = veiwSingleAssignment["dueDate"];
         assignmentDueDate= new Date(assignmentDueDate);
            
            if (assignmentDueDate.getTime()>=sundayOfWeek.getDate()&& assignmentDueDate.getTime() <= sundayOfNextWeek.getTime())
            {
               userAssignments.push(veiwSingleAssignment);
            }
        }
    }
    console.log(userAssignments);
    
    userAssignments = sortAssignmentsByDueDate(userAssignments);

    console.log(userAssignments);
        
    console.log ("user attempting to access calender")
    res.render("calendar", {isLessThan24HourStrings:isLessThan24HourStrings ,get12HourFrom24HourString:get12HourFrom24HourString}); 
   //check if user is authenticated before rendering - will need to do this later on once login/signup is done
   console.log ("user attempting to access calender")
  
   // check if user is an instructor or not , need implamentation 
   //if(req.user.isInstructor === false )
   //res.render("calendar", { userCourses:userCourses, userAssignments:userAssignments,   isLessThan24HourStrings:isLessThan24HourStrings ,get12HourFrom24HourString:get12HourFrom24HourString}); 
   
    //("calendar", { userCourses:userCourses, userAssignments:userAssignments,   isLessThan24HourStrings:isLessThan24HourStrings ,get12HourFrom24HourString:get12HourFrom24HourString, currentClass:req.session.});
  //check if user is authenticated before rendering - will need to do this later on once login/signup is done
});



//in theory this one should already work - MK
app.get( "/logout", ( req, res ) => {
    console.log( "A user is logging out" );
    req.logout();
    res.redirect("/");
});

//Mackenzie's 4 pages
app.get( "/addassignment", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the add assignment page");
    res.render("addassignment", {courseId: "111111111111111111111111"}); //replace hardcoded value with req.body.variable from eric's form
});

app.post("/addassignment", async( req, res ) => {
    console.log(req.body);

    date = req.body.dueDate;
    fixedDate = date.substr(0,4)+"/"+date.substr(5,2)+"/"+date.substr(8,2);

    const assignment = new Assignment({
        assignmentName: req.body.assignName,
        dueDate: fixedDate,
        dueTime: req.body.dueTime,
    });
    assignID = assignment._id;
    console.log(assignID);
    assignment.save();
    courseId = mongoose.Types.ObjectId(req.body.courseId);
    await Course.updateOne({_id: courseId}, 
        {
           $push: {assignmentList: assignID}
        });
    res.redirect("/calendar");
});

app.get( "/editassignment", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the edit assignment page");

    let assignId = "111111111111111111111113" //replace hardcoded value with req.body.variable from eric's form
    const results = await Assignment.find();
    let match = false;
        for(i=0; i< results.length; i++){
            if(results[i]._id == assignId){
                match = true;
                assignName = results[i].assignmentName;
                dueDate = results[i].dueDate;
                dueTime = results[i].dueTime;
                break;
            }
        }
        if(match){
            fixedDate = dueDate.substr(0,4)+"-"+dueDate.substr(5,2)+"-"+dueDate.substr(8,2);
            res.render("editassignment", {assignId: assignId, assignName: assignName, dueDate: fixedDate, dueTime: dueTime});
        }
        else{
            console.log("Error. Assignment not found.")
        }
});

app.post( "/editassignment", async( req, res ) => {
    console.log(req.body);
    //will need to know which assignment is being edited
    //update assignment with info from req.body
    date = req.body.dueDate;
    fixedDate = date.substr(0,4)+"/"+date.substr(5,2)+"/"+date.substr(8,2);
    
    assignId = mongoose.Types.ObjectId(req.body.assignId);
    await Assignment.updateOne({_id: assignId}, 
        { $set: {
            assignmentName: req.body.assignName,
            dueDate: fixedDate,
            dueTime: req.body.dueTime,
        }
        });
    res.redirect("/calendar");
});

app.get( "/addcourse", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the add course page");
    res.render("addcourse", {instrucId: "111111111111111111111111"}); //replace hardcoded value with req.user.userid - passport
});

app.post( "/addcourse", async( req, res ) => {
    console.log(req.body);

    const results = await Course.find();
    newCode = genCode();
    console.log("new code")
    let codeChecked = false;
    while(!codeChecked){
        let match = false;
        for(i=0; i< results.length; i++){
            if(results[i].courseCode == newCode){
                match = true;
                break;
            }
        }
        if(match){//if a code match was found
            newCode = genCode(); //create a new code and loop again
            console.log("new code")
        }
        else{
            codeChecked = true;
            console.log("unique code")
        }
    }

    const course = new Course({
        courseName: req.body.course,
        sectionName: req.body.section,
        instructor: req.body.instrucId, 
        studentList: [],
        assignmentList: [],
        courseCode: newCode
    })
    course.save();
    res.redirect("/calendar");
});

function genCode(){
    let result = '';
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let digits = "123456789";
    for (i = 0; i<4; i++){
        let letterRand = Math.floor(Math.random() * 26); //returns a number between 0 and 25
        result += alphabet.charAt(letterRand);
    }
    for (i = 0; i<4; i++){
        let numberRand = Math.floor(Math.random() * 9); //returns a number between 0 and 8
        result += digits.charAt(numberRand);
    }

    //console.log(Math.random());
    console.log(result);
    return result;
}

app.get( "/joincourse", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the join course page");
    res.render("joincourse", {studId: "111111111111111111111111"}); //replace hardcoded value with req.user.userid - passport
});

app.post( "/joincourse", async( req, res ) => {
    //need student id from req.user.username/id
    //add student's id to add to the course's studentList
    //add course id (if course exists) to the student's listOfCourses
    let foundCourse = false;
    const results = await Course.find();
    for(i = 0; i < results.length; i++){
        if (results[i].courseCode.toLowerCase() == req.body.code.toLowerCase()){
            console.log("a match was found");
            courseId = results[i]._id;
            console.log(courseId);
            foundCourse = true;
            break;
        }
        else{
            console.log("no match yet");
        }
    }
    if(foundCourse){
        studId = mongoose.Types.ObjectId(req.body.studId); //this needs to change later to req.user.userId passport session
        await Course.updateOne({_id: courseId}, 
            { 
                $push: {studentList: studId},
            });

        await User.updateOne({_id: studId}, 
            { 
                $push: {listOfCourses: courseId},  
            });
    }

    res.redirect("/calendar");
});

 app.get( "/nextweek", async( req, res ) => {
    // will take the date ( or sunday date) , and offset by -7 day and return to render calander with new date. -Elc  
 });

 app.get( "/lastweek", async( req, res ) => {
    // will take the date ( or sunday date) , and offset by +7 day and return to render calander with new date. -Elc  
 
 });

 
