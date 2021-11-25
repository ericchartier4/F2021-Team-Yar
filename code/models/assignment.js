const mongoose = require("mongoose");
//create assignment schema
const assignmentSchema = new mongoose.Schema({
    assignmentName: String,
    dueDate: String, //I used the format yyyy-mm-dd -MK
    dueTime: String //24h format: 2:00 pm is 14:00 -MK
});
//assignment collection
const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;