const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Car", 
    required: true 
  }, 
  name: { 
    type: String, 
    required: true 
  }, 
  text: { 
    type: String, 
    required: true 
  }, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Comment", commentSchema);
