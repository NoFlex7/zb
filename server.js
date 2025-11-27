// ================================
// IMPORTS
// ================================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ================================
// APP INIT
// ================================
const app = express();
app.use(cors());
app.use(express.json());

// ================================
// MONGO CONNECTION
// ================================
const MONGO_URI = process.env.MONGO_URI || 
  "mongodb+srv://sadullaernazarovich_db_user:VRQs0YbVZv6IJVbI@cluster0.v9fmj3c.mongodb.net/rentcar?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ================================
// SCHEMAS & MODELS
// ================================

// Car
const carSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  pricePerDay: Number,
  imageUrl: String,
  gallery: [String],
  gearBox: String,
  fuel: String,
  doors: Number,
  seats: Number,
  airConditioner: Boolean,
  distance: Number,
  equipment: [String],
});
const Car = mongoose.model("Car", carSchema);

// Comment
const commentSchema = new mongoose.Schema({
  carId: mongoose.Schema.Types.ObjectId,
  author: { type: String, default: "Anonymous" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", commentSchema);

// Booking
const bookingSchema = new mongoose.Schema({
  carType: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  carName: { type: String, required: true },
  placeOfRental: { type: String, required: true },
  placeOfReturn: { type: String, required: true },
  rentalDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

// Region
const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
const Region = mongoose.model("Region", regionSchema);

// Income
const incomeSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  totalIncome: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
incomeSchema.index({ year: 1, month: 1, day: 1 }, { unique: true });
const Income = mongoose.model("Income", incomeSchema);

// ================================
// INITIAL DATA
// ================================
const regionsList = [
  "Toshkent","Samarqand","Buxoro","Farg'ona","Andijon","Namangan","Xorazm","Qashqadaryo","Surxondaryo","Jizzax","Navoiy","Sirdaryo"
];

// ================================
// ROUTES – CRUD FOR ALL MODELS
// ================================

// ---------- CARS ----------
app.get("/api/cars", async (req,res) => res.json(await Car.find()));
app.get("/api/cars/:id", async (req,res) => {
  const car = await Car.findById(req.params.id);
  if(!car) return res.status(404).json({message:"Car not found"});
  res.json(car);
});
app.post("/api/cars", async (req,res) => {
  const car = new Car(req.body);
  await car.save();
  res.status(201).json(car);
});
app.put("/api/cars/:id", async (req,res) => {
  const updated = await Car.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if(!updated) return res.status(404).json({message:"Car not found"});
  res.json(updated);
});
app.delete("/api/cars/:id", async (req,res) => {
  const deleted = await Car.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:"Car not found"});
  res.json({message:"Car deleted successfully"});
});

// ---------- COMMENTS ----------
app.get("/api/comments/:carId", async (req,res) => {
  const comments = await Comment.find({carId:req.params.carId}).sort({createdAt:-1});
  res.json(comments);
});
app.post("/api/comments", async (req,res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.status(201).json(comment);
});
app.put("/api/comments/:id", async (req,res) => {
  const updated = await Comment.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if(!updated) return res.status(404).json({message:"Comment not found"});
  res.json(updated);
});
app.delete("/api/comments/:id", async (req,res) => {
  const deleted = await Comment.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:"Comment not found"});
  res.json({message:"Comment deleted successfully"});
});

// ---------- BOOKINGS ----------
app.get("/api/bookings", async (req,res) => res.json(await Booking.find().sort({createdAt:-1})));

app.post("/api/bookings", async (req,res) => {
  try {
    const car = await Car.findById(req.body.carType);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const booking = new Booking({
      ...req.body,
      carName: car.name,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

app.put("/api/bookings/:id", async (req,res) => {
  try {
    const updateData = { ...req.body };
    if(req.body.carType) {
      const car = await Car.findById(req.body.carType);
      if(!car) return res.status(404).json({message:"Car not found"});
      updateData.carName = car.name;
    }
    const updated = await Booking.findByIdAndUpdate(req.params.id, updateData, {new:true});
    if(!updated) return res.status(404).json({message:"Booking not found"});
    res.json(updated);
  } catch(err) {
    console.error(err);
    res.status(500).json({message:"Error updating booking", error:err.message});
  }
});

app.delete("/api/bookings/:id", async (req,res) => {
  const deleted = await Booking.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:"Booking not found"});
  res.json({message:"Booking deleted successfully"});
});

// ---------- REGIONS ----------
app.get("/api/regions", async (req,res) => res.json(await Region.find()));

app.post("/api/regions", async (req,res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    res.status(201).json(region);
  } catch(err) {
    res.status(400).json({message:"Error adding region", error:err.message});
  }
});

app.put("/api/regions/:id", async (req,res) => {
  const updated = await Region.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if(!updated) return res.status(404).json({message:"Region not found"});
  res.json(updated);
});

app.delete("/api/regions/:id", async (req,res) => {
  const deleted = await Region.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:"Region not found"});
  res.json({message:"Region deleted successfully"});
});

// ---------- INCOME ----------
app.get("/api/income/:year/:month/:day", async (req,res) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  const day = parseInt(req.params.day);
  const income = await Income.findOne({year, month, day});
  if(!income) return res.status(404).json({message:"Income not found"});
  res.json(income);
});

app.post("/api/income", async (req,res) => {
  try {
    const {year, month, day, totalIncome} = req.body;
    if(!year || !month || !day || totalIncome === undefined) 
      return res.status(400).json({message:"Missing fields"});

    const income = new Income({
      year, month, day,
      totalIncome: totalIncome ?? 0
    });

    await income.save();
    res.status(201).json(income);
  } catch(err) {
    if(err.code===11000) return res.status(400).json({message:"Income exists for this date"});
    res.status(500).json({message:"Error saving income"});
  }
});

app.put("/api/income/:id", async (req,res) => {
  const updated = await Income.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if(!updated) return res.status(404).json({message:"Income not found"});
  res.json(updated);
});

app.delete("/api/income/:id", async (req,res) => {
  const deleted = await Income.findByIdAndDelete(req.params.id);
  if(!deleted) return res.status(404).json({message:"Income not found"});
  res.json({message:"Income deleted successfully"});
});

// ================================
// SERVER START
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚗 RentCar API running on http://localhost:${PORT}`);

  // Insert regions if empty (safe upsert)
  for (const name of regionsList) {
    await Region.updateOne({ name }, { name }, { upsert: true });
  }
  console.log("✅ Regions initialized");
});
