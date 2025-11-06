const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({

  name: { type: String, required: true },            
  brand: { type: String, required: true },            
  category: {
    type: String,
    required: true,
    enum: ["Sedan", "Cabriolet", "Pickup", "SUV", "Minivan"], 
  },
  pricePerDay: { type: Number, required: true },       


  imageUrl: { type: String },                          
  gallery: {
    type: [String],                                   
    validate: {
      validator: function (arr) {
        return arr.length >= 4;
      },
      message: "At least 4 images are required in the gallery.",
    },
    required: true,
  },

  gearBox: { type: String, default: "Automatic" },   
  fuel: { type: String, default: "Petrol" },         
  doors: { type: Number, default: 4 },                 
  seats: { type: Number, default: 5 },                 
  airConditioner: { type: Boolean, default: true },    
  distance: { type: Number, default: 0 },          

 
  equipment: [
    {
      type: String,                                   
    },
  ],


  available: { type: Boolean, default: true },        

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", carSchema);
