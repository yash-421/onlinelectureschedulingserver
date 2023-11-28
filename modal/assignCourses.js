const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instructors'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses', // Assuming your courses model is named 'courses'
  },
  date: {
    type: Date,
  },
  batch: {
    type: String,
  },
},
{
  timestamps:true
});

const assignCourses = mongoose.model("assignCourses", schema);

module.exports = assignCourses;
