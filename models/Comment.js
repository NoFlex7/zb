const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Car", 
    required: true 
  }, // reference to the car
  name: { 
    type: String, 
    required: true 
  }, // user name
  text: { 
    type: String, 
    required: true 
  }, // comment content
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Comment", commentSchema);
