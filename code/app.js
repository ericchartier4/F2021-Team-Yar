const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const User = require("./models/user").User;
const Assignment = require("./models/assignment");
const Course = require("./models/course");
const { captureRejections } = require("events");
require("dotenv").config();

const app = express();
app.use(express.static("public"));
// a common localhost test port
const port = 3000;

// body-parser is now built into express!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// connect to mongoose on port 27017
mongoose.connect('mongodb://localhost:27017/taskmaster', { useNewUrlParser: true, useUnifiedTopology: true });


// Simple server operation
app.listen ( port, () => {
    // template literal
    console.log ( `Server is running on http://localhost:${port}` );
});

//Ifeanyichukwu
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

//Ifeanyichukwu
app.post("/signup", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let authentication = req.body.authentication;
       
        console.log(req.body)
        if(req.body.type == "instructor"){
            if (authentication != "grades") {
                return res.redirect("/");
               }
            console.log("isInstructor")
            isInstructor = true;                             
        }else{
            console.log("isStudent")
            isInstructor = false;
        }
            User.register({ username : username, isInstructor : isInstructor }, 
                password, 
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
        console.log(req.body)
        console.error(error);
    }
});

//Ifeanyichukwu
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

//Ifeanyichukwu
app.post("/login", (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            authentication: req.body.authentication,
        });
        if(req.body.type == "instructor"){
            if (req.body.authentication != "grades") {
                return res.redirect("/");
               }
            console.log("isInstructor")
            isInstructor = true;                             
        }
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

//Logout
app.get( "/logout", ( req, res ) => {
    console.log( "A user is logging out" );
    req.logout();
    res.redirect("/");
});

//Eric
app.get( "/calendar", async( req, res ) => {  

    console.log ("user attempting to access calendar")
    console.log("user request to calendar");
    if ( req.isAuthenticated() ){
        try {
            console.log( "User was authorized" );
        if (  req.user.isInstructor == true )
        {
                res.redirect("/instructorCalendar");
        }
        else 
        {
            res.redirect("/studentCalendar");
        }
        } catch ( error ) {
            console.log( error );
        }
    } else {
        console.log( "User was not authorized." );
        res.redirect( "/" );
    }
});

//Eric
app.get ("/instructorCalendar", async(req,res)=>{
    console.log("user request to instructor calendar ");
  if ( req.isAuthenticated() ){
    try {
        console.log( "User was authorized" );
        
    if (!req.session.calendarDatePointer) {  
        req.session.calendarDatePointer = new Date();
        req.session.calendarDatePointer.setHours(0);
        req.session.calendarDatePointer.setMinutes(0);
        req.session.calendarDatePointer.setSeconds(0);
        req.session.calendarDatePointer.setMilliseconds(0);
      }
    if (!req.session.instructorCourseIdPointer)
    {
        let firstCourse = await User.findOne({_id:req.user._id})
      
        firstCourse = firstCourse["listOfCourses"]
        if (firstCourse.length !== 0  )
        {  
            firstCourse = firstCourse[0] 
            req.session.instructorCourseIdPointer = firstCourse.valueOf();
        }
        else 
        {
            req.session.instructorCourseIdPointer =[];
        } 
    }
    
    let dayofWeek =  await new Date( req.session.calendarDatePointer); //returns 0= sunday , 1 = monday...
    dayofWeek = dayofWeek.getDay();
    let sundayOfWeek = new Date (req.session.calendarDatePointer);
    sundayOfWeek.setDate(sundayOfWeek.getDate()-dayofWeek);
    let saturdayOfWeek =  new Date(await getSaturdayOfWeek(sundayOfWeek));
 
    let courseList = new Array();
    let assignmentList = new Array(); 
    let assignmentInfoList = new Array();  
    let currentCourse;
    courseList  =  await getCourseList(req.user._id)
    if (courseList.length !== 0)
    {
        let singleCourseArray = new Array( req.session.instructorCourseIdPointer); 
        assignmentList = await getAssignmentsOfWeek(singleCourseArray,sundayOfWeek)
        assignmentList = await sortAssignmentsByDueDate(assignmentList);
        assignmentInfoList = await getAssignmentInfoForPrint(assignmentList,singleCourseArray);
        currentCourse = req.session.instructorCourseIdPointer;
        }
        else 
        {
            currentCourse = null
        }
        
        console.log(req.session.instructorCourseIdPointer);
        
        res.render("instructorCalendar", {  assignmentInfoList:assignmentInfoList, courseList: courseList, sundayOfWeek:new Date(sundayOfWeek),saturdayOfWeek:new Date(saturdayOfWeek),  isLessThan24HourStrings:isLessThan24HourStrings ,currentCourse: currentCourse, courseList:courseList}); 
        } catch ( error ) {
            console.log( error );
        }
    } else {
        console.log( "User was not authorized." );
        res.redirect( "/" );
    }
})
app.get("/studentCalendar", async(req,res)=>{
        console.log("user request student calendar  ");
        if ( req.isAuthenticated() ){
          try {
    console.log( "User was authorized" );
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
   
    let courseList  =  await getCourseList(req.user._id)
    let assignmentList = [];
    let assignmentInfoList = [];
    if (courseList.length !== 0) 
    {
        
        assignmentList =  await getAssignmentsOfWeek(courseList, sundayOfWeek)
        assignmentList = await sortAssignmentsByDueDate(assignmentList);
        assignmentInfoList = await getAssignmentInfoForPrint(assignmentList,courseList);
      
    }                                                        
   
    res.render("studentCalendar", { assignmentInfoList:assignmentInfoList, sundayOfWeek: new Date (sundayOfWeek), saturdayOfWeek:new Date(saturdayOfWeek) , isLessThan24HourStrings:isLessThan24HourStrings }); 
              
          } catch ( error ) {
              console.log( error );
          }
      } else {
          console.log( "was not authorized." );
          res.redirect( "/" );
      }
});

//Mackenzie
app.post( "/addassignment", ( req, res ) => {
    console.log("user accessed the add assignment page");
    res.render("addassignment", {courseId: req.body.courseId});
});

//Mackenzie
app.post("/addassign", async( req, res ) => {
    date = req.body.dueDate;
    fixedDate = date.substr(0,4)+"/"+date.substr(5,2)+"/"+date.substr(8,2);

    const assignment = new Assignment({
        assignmentName: req.body.assignName,
        dueDate: fixedDate,
        dueTime: req.body.dueTime,
    });
    assignID = assignment._id;
    assignment.save();
    courseId = mongoose.Types.ObjectId(req.body.courseId);
    await Course.updateOne({_id: courseId}, 
        {
           $push: {assignmentList: assignID}
        });
    res.redirect("/calendar");
});

//Mackenzie
app.post( "/editassignment", async( req, res ) => {
    console.log("user accessed the edit assignment page");
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

//Mackenzie
app.post( "/edassign", async( req, res ) => {
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

//Mackenzie
app.post( "/addcourse", ( req, res ) => {
    console.log("user accessed the add course page");
    res.render("addcourse");
});

//Mackenzie
app.post( "/newcourse", async( req, res ) => {
    const results = await Course.find();
    newCode = genCode();
    console.log("new code generated")
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
            console.log("new code being generated")
        }
        else{
            codeChecked = true;
            console.log("the code is unique")
        }
    }

    instrucId = mongoose.Types.ObjectId(req.user._id);
    const course = new Course({
        courseName: req.body.course,
        sectionName: req.body.section,
        instructor: instrucId, 
        studentList: [],
        assignmentList: [],
        courseCode: newCode
    });
    
    courseId = course._id;
    req.session.instructorCourseIdPointer = courseId;
    course.save();
    await User.updateOne({_id: instrucId}, 
        {
            $push: {listOfCourses: courseId}
        });
    res.redirect("/calendar");
});

//Mackenzie
app.post( "/joincourse", ( req, res ) => {
    console.log("user accessed the join course page");
    res.render("joincourse");
});

//Mackenzie
app.post( "/jncourse", async( req, res ) => {
    let foundCourse = false;
    const results = await Course.find();
    for(i = 0; i < results.length; i++){
        if (results[i].courseCode.toLowerCase() == req.body.code.toLowerCase()){
            console.log("a match was found");
            courseId = results[i]._id;
            foundCourse = true;
            break;
        }
        else{
            console.log("no match yet");
        }
    }
    if(foundCourse){
        studId = mongoose.Types.ObjectId(req.user._id);
        await Course.updateOne({_id: courseId}, 
            { 
                $push: {studentList: studId},
            });

        await User.updateOne({_id: studId}, 
            { 
                $push: {listOfCourses : courseId},  
            });
    }
    res.redirect("/calendar");
});

//Eric
 app.get( "/nextWeek", async( req, res ) => {
    console.log("user request to get next week  ");
    if ( req.isAuthenticated() ){
        try {
            console.log( "User was authorized" );
            let weekIncrament = await new Date( req.session.calendarDatePointer);
        await weekIncrament.setDate(weekIncrament.getDate()+7);
        req.session.calendarDatePointer = weekIncrament;
        res.redirect("/calendar")
        } catch ( error ) {
            console.log( error );
        }
    } else {
        console.log( "User was not authorized." );
        res.redirect( "/" );
    }
 });

 //Eric
 app.get( "/lastWeek", async( req, res ) => {
    console.log("user request to get last week  ");
    if ( req.isAuthenticated() ){
        try {
            console.log( "User was authorized" );
            let weekDecrament = await new Date( req.session.calendarDatePointer);
            await weekDecrament.setDate(weekDecrament.getDate()-7);
            req.session.calendarDatePointer = weekDecrament;
            res.redirect("/calendar")
        } catch ( error ) {
            console.log( error );
        }
    } else {
        console.log( "was not authorized." );
        res.redirect( "/" );
    }
});

 //Eric
 app.post( "/instructorSelectCourse", ( req, res ) => {
    console.log("user request to instructorselectcourse ");
    if ( req.isAuthenticated() ){
      try {
          console.log( "User was authorized" );
        req.session.instructorCourseIdPointer=req.body.selecter;

        res.redirect("/calendar");
      } catch ( error ) {
          console.log( error );
      }
  } else {
      console.log( "User was not authorized." );
      res.redirect( "/" );
  }
}); 

//FUNCTIONS

//Mackenzie
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

    console.log(result);
    return result;
}

//Eric
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

//Eric
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

//Eric
async function getSaturdayOfWeek(sundayOfWeek)
{   
    let saturdayOfWeek = new Date(sundayOfWeek);
    saturdayOfWeek.setDate(sundayOfWeek.getDate() +6); 
    return saturdayOfWeek;
   
}

//Eric
async function getSundayOfNextWeek(sundayOfWeek)
{
    let saturdayOfWeek =   new Date (await getSaturdayOfWeek( sundayOfWeek));
    let sundayOfNextWeek =  saturdayOfWeek
    sundayOfNextWeek.setDate(saturdayOfWeek.getDate()+1);
    return sundayOfNextWeek;
}

//Eric
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

//Eric
 async function getAssignmentsOfWeek(courseListArray, sundayOfWeek)
{
    let userAssignments = []; 
    console.log(courseListArray);
    let sundayOfNextWeek = new Date(await getSundayOfNextWeek(sundayOfWeek));
    if(courseListArray.length !== 0)
    {
        for (let i of courseListArray)
        {      
            
            let viewAssignmentList = await Course.findOne({_id: i });
            if (viewAssignmentList.length !== 0 )
            {
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
        }
    }
    return userAssignments
}

//Eric
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

//Eric
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

//Eric
async function getAssignmentName(assignmentId)
{
    let assignmentName = await Assignment.findOne({_id:assignmentId})
    assignmentName=assignmentName["assignmentName"];
    return assignmentName;

}

//Eric
async function getAssignmentDueDateInWeek(assignmentId)
{
   let assignmentDate = await Assignment.findOne({_id:assignmentId})
   assignmentDate=assignmentDate["dueDate"];
   assignmentDate= new Date(assignmentDate);
   assignmentDate = assignmentDate.getDay();
   return assignmentDate;

}

//Eric
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

//Eric
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