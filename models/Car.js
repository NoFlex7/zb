const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  // Basic information
  name: { type: String, required: true },              // e.g. BMW M3
  brand: { type: String, required: true },             // e.g. BMW
  category: {
    type: String,
    required: true,
    enum: ["Sedan", "Cabriolet", "Pickup", "SUV", "Minivan"], // allowed categories
  },
  pricePerDay: { type: Number, required: true },       // e.g. 25 (USD per day)

  // Images
  imageUrl: { type: String },                          // main image
  gallery: {
    type: [String],                                    // must contain at least 4 image URLs
    validate: {
      validator: function (arr) {
        return arr.length >= 4;
      },
      message: "At least 4 images are required in the gallery.",
    },
    required: true,
  },

  // Technical specifications
  gearBox: { type: String, default: "Automatic" },     // e.g. Automatic / Manual
  fuel: { type: String, default: "Petrol" },           // e.g. Petrol, Diesel, Electric
  doors: { type: Number, default: 4 },                 // number of doors
  seats: { type: Number, default: 5 },                 // number of seats
  airConditioner: { type: Boolean, default: true },    // AC availability
  distance: { type: Number, default: 0 },              // e.g. 500 (km)

  // Car equipment / features
  equipment: [
    {
      type: String,                                    // e.g. ABS, Air Bags, Cruise Control
    },
  ],

  // Availability
  available: { type: Boolean, default: true },         // available for rent or not

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", carSchema);
