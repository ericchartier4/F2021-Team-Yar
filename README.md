# F2021-Team-Yar
ENSE 374 Team Yar Project repository 

Hello! We are team Yar and this is our project, Taskmaster!
Taskmaster aims for better schedule planning between students and instructors.
The current version of our application allows instructors to create courses and create and edit assginments, and
students can join courses to view the assginments from each course.


INSTALLATION INSTRUCTIONS:
Before Installing: This application runs on a localhost so you must have the ability to run mongoose.

1. Download the application by clicking the "code" button and then the "download zip" button on GitHub.
2. Extract the files and open a git bash in the folder named "code" 
3. To be able to run this app, passport needs a .env file. You need a .env file to run the code and it is used for local user authentication.
    The program cannot run without it. Create a .env file, and inside it make your own authentication key. It must look something like this:
    SECRET=Something secret to encrypt our session
    This file must be under the code folder.
4. Open two terminals (we prefer Windows Powershell). In one, type the command "mongod" and press enter. In the other, type "mongo" and press enter.
    You now have your local database up and running!
5. In the git bash you opened under the "code" folder, first run the command: "npm init" 
    Press enter until it stops prompting you for input.
6. Next, run the command: "npm i express ejs mongoose"
    This installs some of the requirements to run the application.
7. Once that is done, run: "npm i passport passport-local passport-local-mongoose express-session dotenv"
    This installs the remaining requirements to run the application.
8. You can now run the application by running the command: "nodemon app.js"
9. The application is now running. In a browser, type "localhost:3000" and you will be taken to the login screen!
