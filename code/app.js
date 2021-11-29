var vm = require("vm");
var fs = require("fs");

//include functions file
var functions = fs.readFileSync('functions.js');
const script = new vm.Script(functions);
script.runInThisContext();

const express  = require( "express" );
const mongoose = require( "mongoose" );

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user").User;
const Assignment = require("./models/assignment");
const Course = require("./models/course");
const { log } = require("console");
require("dotenv").config();

const app = express(); 
app.use(express.static("public"));
// a common localhost test port
const port = 3000; 

// body-parser is now built into express!
app.use(express.json());
app.use( express.urlencoded( { extended: true} ) ); 

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use (passport.initialize());
app.use (passport.session());

app.set( "view engine", "ejs" );
app.set("views","./views");

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //number is instructor id - we never made any functionality for multiple instructors, 
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
//const User = mongoose.model ( "User", userSchema );

//course collection
//const Course = mongoose.model ( "Course", courseSchema );

//assignment collection
//const Assignment = mongoose.model ( "Assignment", assignmentSchema );

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Simple server operation
app.listen ( port, () => {
    // template literal
    console.log ( `Server is running on http://localhost:${port}` );
});

app.get("/", (req, res) => {
    console.log("A user is accessing the root route using get");
    try {
        if (req.isAuthenticated()) {
            res.redirect("/calendar");
        } else {
            res.redirect("/login");
        }
    }
    catch (error) {
        console.error(error);
        res.send(error);
    }
});

//signup and login forms - Ify you might need 2 of /signup since the signup form for an instructor is different with the auth code
//I think /login should work for both since they're the same? Do whatever you need to -MK
app.post("/signup", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        console.log(req.body)
        if(req.body.type == "instructor"){
            console.log("isInstructor")
            isInstructor = true; //added this
            //check if auth code is correct, if not then don't do the User.register below
        }else{
            console.log("isStudent")
            isInstructor = false; //added this
        }
            User.register({ username : username, isInstructor : isInstructor }, 
                req.body.password, 
                ( err, user ) => {
                if ( err ) {
                console.log( err );
                    res.redirect( "/" );
                } else {
                    passport.authenticate( 'local', { successRedirect:'/calendar',
                    failureRedirect: '/' })( req, res, () => { 
                        res.redirect( "/calendar" ); 
                    });  
                }
            });
    }
    catch (error) {
        // console.log("Cannot find user")
        console.log(req.body)
        console.error(error);
        // res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            res.render("login", {});
        }
    }
    catch (error) {
        console.error(error);
        res.send(error);
    }
});



app.post("/login", (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });
        console.log(req.body)
        req.login(user, (err) => {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else {
                
                        passport.authenticate( 'local', { successRedirect:'/calendar',
                        failureRedirect: '/' })( req, res, () => { 
                            res.redirect( "/calendar" ); 
                        });          
            }
        });
    }
    catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});
function saveUser(username, password, isInstructor) {
    new Promise((resolve, reject) => {
        User.register({ username: username, isInstructor: isInstructor }, password, (err, user) => {
            if (err) {
                console.log(err);
                reject("can not save the user in db");
            }
            else {
                resolve(user);
            }
        });
    });
}






//Eric - I'm guessing you'll need async here to use await while you get the assignment data so that's why I left it there- feel free to 
//get rid of it if you aren't going to need it -MK






















function isLessThan24HourStrings(  lessThanTimeString, moreThanTimeString) {
let result = false;

let [lessThanHours, lessThanMinutes] = lessThanTimeString.split(':');
let [moreThanHours, moreThanMinutes] = moreThanTimeString.split(':');
 
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



async function getSaturdayOfWeek(sundayOfWeek)
{   
    let saturdayOfWeek = new Date(sundayOfWeek);
    saturdayOfWeek.setDate(sundayOfWeek.getDate() +6); 
    return saturdayOfWeek;
   
}
async function getSundayOfNextWeek(sundayOfWeek)
{
   

    let saturdayOfWeek =   new Date (await getSaturdayOfWeek( sundayOfWeek));
    let sundayOfNextWeek =  saturdayOfWeek
    sundayOfNextWeek.setDate(saturdayOfWeek.getDate()+1);
    return sundayOfNextWeek;
}

async function  getCourseList(userId)
{
    
let Courses=[];
let courseListArray = await User.findOne({_id:userId});
courseListArray= courseListArray["listOfCourses"];
for (let i of courseListArray)
{
let viewSingleCourse = await Course.findOne({_id: i });
Courses.push(viewSingleCourse);
}
return Courses;
}

 async function getAssignmentsOfWeek(courseListArray, sundayOfWeek)
{
    let userAssignments = []; 
   
    let sundayOfNextWeek = new Date(await getSundayOfNextWeek(sundayOfWeek));
    for (let i of courseListArray)
    {      
        
        let viewAssignmentList = await Course.findOne({_id: i });
        viewAssignmentList= viewAssignmentList["assignmentList"];
        for (let j of viewAssignmentList)
        {
         let viewSingleAssignment = await Assignment.findOne({_id:j});
         let assignmentDueDate = viewSingleAssignment["dueDate"];
         assignmentDueDate= new Date(assignmentDueDate);
            
            if (assignmentDueDate.getTime()>=sundayOfWeek.getTime()&& assignmentDueDate.getTime() <= sundayOfNextWeek.getTime())
            {
               
               userAssignments.push(viewSingleAssignment);
            }
        }
    }
    return userAssignments
}



async function getCourseNameOfAssignment(assignmentId,courseList)
{
let courseName;

   for( let courseInstance of courseList)
   {
   let viewCourse =  await Course.findOne({_id:courseInstance})
      let viewCourseAssignments = viewCourse["assignmentList"]
    
    for( let j of viewCourseAssignments)
    {    
       
        
        if ( j.valueOf()  === assignmentId.valueOf()  )  //change here when avalible
        {   
            
            courseName =  courseInstance["courseName"];
            
        }
    }
   }
return courseName;

}
async function getCourseSectionOfAssignment(assignmentId,courseList)
{
    let courseSection;
    for( let courseInstance of courseList)
    {
    let viewCourseAssignments =  await Course.findOne({_id:courseInstance})
     viewCourseAssignments = viewCourseAssignments["assignmentList"]
     for( let j of viewCourseAssignments)
     {
         if (j.valueOf()  === assignmentId.valueOf()  )
         {
             courseSection = courseInstance["sectionName"];
         }
     }
    }
 return courseSection;

}
async function getAssignmentName(assignmentId)
{
   let assignmentName = await Assignment.findOne({_id:assignmentId})
   assignmentName=assignmentName["assignmentName"];
    return assignmentName;

}
async function getAssignmentDueDateInWeek(assignmentId)
{
   let assignmentDate = await Assignment.findOne({_id:assignmentId})
   assignmentDate=assignmentDate["dueDate"];
   assignmentDate= new Date(assignmentDate);
   assignmentDate = assignmentDate.getDay();
   return assignmentDate;

}
async function getAssignmentTime12HourString(assignmentId)
{
   let assignmentTime = await Assignment.findOne({_id:assignmentId})
   assignmentTime=assignmentTime["dueTime"];
   let result;
 let [hour, minutes] = assignmentTime.split(':');
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
   return assignmentTime;
}

async function getAssignmentInfoForPrint(assignmentList, courseList)
{
   let assignmentInfoArray=[]
   
   for ( let i of assignmentList)
   {
       let assignmentContainer = { _id:i["_id"], 
        assignmentName: await getAssignmentName(i),
        courseName: await getCourseNameOfAssignment(i["_id"],courseList) ,
        courseSection:  await getCourseSectionOfAssignment(i["_id"],courseList),
        dueDateInWeek: await getAssignmentDueDateInWeek(i) , 
        dueTime24Hour: i["dueTime"] ,
        dueTime12Hour:  await getAssignmentTime12HourString(i) }
        assignmentInfoArray.push(assignmentContainer)
   } 

   return assignmentInfoArray;


} 
app.get( "/calendar", async( req, res ) => {  

    console.log ("user attempting to access calender")

    // will assess if student or instructor
    res.redirect("/instructorCalendar")
});

app.get ("/instructorCalendar", async(req,res)=>{
    if (!req.session.calendarDatePointer) {  
        req.session.calendarDatePointer = new Date();
        req.session.calendarDatePointer.setHours(0);
        req.session.calendarDatePointer.setMinutes(0);
        req.session.calendarDatePointer.setSeconds(0);
        req.session.calendarDatePointer.setMilliseconds(0);
      }
    if (!req.session.instructorCourseIdPointer )
    {
        let firstCourse = await User.findOne({_id:"111111111111111111111111"})
        firstCourse = firstCourse["listOfCourses"]
       
        if (firstCourse !== null )
        { 
        firstCourse = firstCourse[0] 
        req.session.instructorCourseIdPointer = firstCourse.valueOf();
        }
        else 
        {
        req.session.instructorCourseIdPointer=null;
        }
        
    }
    let dayofWeek =  await new Date( req.session.calendarDatePointer); //returns 0= sunday , 1 = monday...
    dayofWeek = dayofWeek.getDay();
    let sundayOfWeek = new Date (req.session.calendarDatePointer);
    sundayOfWeek.setDate(sundayOfWeek.getDate()-dayofWeek);
    let saturdayOfWeek =  new Date(await getSaturdayOfWeek(sundayOfWeek));
    
    let courseList
    let assignmentList ; 
     if( req.session.instructorCourseIdPointer !== null)
     {
     let singleCourseArray = new Array( req.session.instructorCourseIdPointer); 
     assignmentList = await getAssignmentsOfWeek(singleCourseArray,sundayOfWeek)
     assignmentList = await sortAssignmentsByDueDate(assignmentList);
     assignmentInfoList = await getAssignmentInfoForPrint(assignmentList,singleCourseArray);
     courseList  =  await getCourseList("111111111111111111111111")
     }
     else
     {
        courseList =null; 
        assignmentList = null;
     }
     
   
    
    
    res.render("instructorCalendar", {  assignmentInfoList:assignmentInfoList, courseList: courseList, sundayOfWeek:new Date(sundayOfWeek),saturdayOfWeek:new Date(saturdayOfWeek),  isLessThan24HourStrings:isLessThan24HourStrings ,currentCourse: req.session.instructorCourseIdPointer, courseList:courseList}); 





})
app.get("/studentCalendar", async(req,res)=>{
    if (!req.session.calendarDatePointer) {  
        req.session.calendarDatePointer = new Date();
        req.session.calendarDatePointer.setHours(0);
        req.session.calendarDatePointer.setMinutes(0);
        req.session.calendarDatePointer.setSeconds(0);
        req.session.calendarDatePointer.setMilliseconds(0);
      }
    
    let dayofWeek =  await new Date( req.session.calendarDatePointer); //returns 0= sunday , 1 = monday...
    dayofWeek = dayofWeek.getDay();
    let sundayOfWeek =  await new Date ( req.session.calendarDatePointer);
     await sundayOfWeek.setDate(sundayOfWeek.getDate()-dayofWeek);
    let saturdayOfWeek =   new Date( await getSaturdayOfWeek(sundayOfWeek));
   
    let courseList  =  await getCourseList("111111111111111111111111")
    let assignmentList
   
    if (courseList !== null)
    {
        
        assignmentList =  await getAssignmentsOfWeek(courseList, sundayOfWeek)
        assignmentList = await sortAssignmentsByDueDate(assignmentList);
        assignmentInfoList = await getAssignmentInfoForPrint(assignmentList,courseList);
      
    }                                                        
    else 
    {
        assignmentList = null;
    }
   
    
    


    res.render("studentCalendar", { assignmentInfoList:assignmentInfoList, sundayOfWeek: new Date (sundayOfWeek), saturdayOfWeek:new Date(saturdayOfWeek) , isLessThan24HourStrings:isLessThan24HourStrings }); 

})















//in theory this one should already work - MK
app.get( "/logout", ( req, res ) => {
    console.log( "A user is logging out" );
    req.logout();
    res.redirect("/");
});

//Mackenzie's 4 pages
app.post( "/addassignment", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the add assignment page");
    res.render("addassignment", {courseId: req.body.courseId}); //replace hardcoded value with req.body.variable from eric's form
});

app.post("/addassign", async( req, res ) => {
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

app.post( "/editassignment", async( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the edit assignment page");
    console.log(req.body)
    let assignId = req.body.assignId
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

app.post( "/edassign", async( req, res ) => {
    console.log(req.body);
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

app.post( "/addcourse", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the add course page");
    console.log(req.user)
    res.render("addcourse", {instrucId: "111111111111111111111111"}); //replace hardcoded value with req.user.userid - passport
});

app.post( "/newcourse", async( req, res ) => {
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
    instrucId = mongoose.Types.ObjectId(req.body.instrucId);
    const course = new Course({
        courseName: req.body.course,
        sectionName: req.body.section,
        instructor: instrucId, 
        studentList: [],
        assignmentList: [],
        courseCode: newCode
    })
    course.save();
    res.redirect("/calendar");
});

app.post( "/joincourse", ( req, res ) => {
    //check if user is authenticated before rendering - will need to do this later on once login/signup is done
    console.log("user accessed the join course page");
    res.render("joincourse", {studId: "111111111111111111111111"}); //replace hardcoded value with req.user.userid - passport
});

app.post( "/jncourse", async( req, res ) => {
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

 app.get( "/nextWeek", async( req, res ) => {
    
    let weekIncrament = await new Date( req.session.calendarDatePointer);
    await weekIncrament.setDate(weekIncrament.getDate()+7);
    req.session.calendarDatePointer = weekIncrament;
    res.redirect("/calendar")
    
 });

 app.get( "/lastWeek", async( req, res ) => {
    let weekDecrament = await new Date( req.session.calendarDatePointer);
    await weekDecrament.setDate(weekDecrament.getDate()-7);
    req.session.calendarDatePointer = weekDecrament;
    res.redirect("/calendar")
 
 });

 
 app.post( "/instructorSelectCourse", ( req, res ) => {
   console.log(req.body.selecter);
   req.session.instructorCourseIdPointer=req.body.selecter;

    res.redirect("/calendar");
}); 
