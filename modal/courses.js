const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  batch: {
    type: String,
  },
},
{
  timestamps:true
}

);

const courses = mongoose.model("courses", schema);

module.exports = courses;
