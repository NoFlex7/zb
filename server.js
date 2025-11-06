// ================================
// Rent Car API Server (MongoDB bilan)
// Built with Node.js + Express + Mongoose
// ================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sadullaernazarovich_db_user:VRQs0YbVZv6IJVbI@cluster0.v9fmj3c.mongodb.net/";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================================
// Models
// ================================

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

const commentSchema = new mongoose.Schema({
  carId: mongoose.Schema.Types.ObjectId,
  author: { type: String, default: "Anonymous" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

const bookingSchema = new mongoose.Schema({
  carType: { type: String, required: true },
  placeOfRental: { type: String, required: true },
  placeOfReturn: { type: String, required: true },
  rentalDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

// Region model
const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Region = mongoose.model("Region", regionSchema);

const regionsList = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Farg‘ona",
  "Andijon",
  "Namangan",
  "Xorazm",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Navoiy",
  "Sirdaryo",
];

// ================================
// Routes: Cars
// ================================

app.get("/api/cars", async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
});

app.get("/api/cars/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

app.get("/api/cars/category/:category", async (req, res) => {
  const category = req.params.category.toLowerCase();
  const cars = await Car.find({
    category: { $regex: new RegExp("^" + category + "$", "i") },
  });
  if (cars.length === 0)
    return res.status(404).json({ message: "No cars found in this category" });
  res.json(cars);
});

app.post("/api/cars", async (req, res) => {
  const newCar = new Car(req.body);
  await newCar.save();
  res.status(201).json(newCar);
});

app.put("/api/cars/:id", async (req, res) => {
  const updated = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Car not found" });
  res.json(updated);
});

app.delete("/api/cars/:id", async (req, res) => {
  const deleted = await Car.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Car not found" });
  res.json({ message: "Car deleted successfully" });
});

// ================================
// Routes: Comments
// ================================

app.get("/api/comments/:carId", async (req, res) => {
  const carComments = await Comment.find({ carId: req.params.carId }).sort({
    createdAt: -1,
  });
  res.json(carComments);
});

app.post("/api/comments", async (req, res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.status(201).json(comment);
});

// ================================
// Routes: Bookings
// ================================

app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

app.post("/api/booking", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({
      message: "✅ Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
// Routes: Regions (Uzbekistan)
// ================================

app.get("/api/regions", async (req, res) => {
  const regions = await Region.find();
  res.json(regions);
});

app.get("/api/regions/:id", async (req, res) => {
  const region = await Region.findById(req.params.id);
  if (!region) return res.status(404).json({ message: "Region not found" });
  res.json(region);
});

app.post("/api/regions", async (req, res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    res.status(201).json(region);
  } catch (err) {
    res.status(400).json({ message: "Error adding region", error: err.message });
  }
});

app.delete("/api/regions/:id", async (req, res) => {
  const deleted = await Region.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Region not found" });
  res.json({ message: "Region deleted successfully" });
});

// ================================
// Root Route
// ================================

app.get("/", (req, res) => {
  res.send("🚗 RentCar API is running successfully!");
});

// ================================
// Server
// ================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚗 RentCar API Server running on http://localhost:${PORT}`);

  // Agar hali viloyatlar saqlanmagan bo'lsa, dastlabki 12 viloyatni qo'shish
  const count = await Region.countDocuments();
  if (count === 0) {
    await Region.insertMany(regionsList.map((name) => ({ name })));
    console.log("✅ 12 ta viloyat dastlabki ma'lumot sifatida qo'shildi");
  }
});
