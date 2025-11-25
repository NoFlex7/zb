// ================================
// Rent Car API Server (MongoDB)
// Node.js + Express + Mongoose
// ================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// MongoDB Connection
// ================================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sadullaernazarovich_db_user:VRQs0YbVZv6IJVbI@cluster0.v9fmj3c.mongodb.net/";

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI)
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
  carType: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  placeOfRental: String,
  placeOfReturn: String,
  rentalDate: Date,
  returnDate: Date,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
const Region = mongoose.model("Region", regionSchema);

// ================================
// Income Schema
// ================================

const incomeSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  totalIncome: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

incomeSchema.index({ year: 1, month: 1, day: 1 }, { unique: true });

incomeSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.createdAt) {
      ret.createdAt = ret.createdAt.toISOString().split("T")[0];
    }
    return ret;
  },
});

const Income = mongoose.model("Income", incomeSchema);

const regionsList = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Farg'ona",
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
  res.json(await Car.find());
});

app.get("/api/cars/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

app.post("/api/cars", async (req, res) => {
  const newCar = new Car(req.body);
  await newCar.save();
  res.status(201).json(newCar);
});

// ================================
// Routes: Bookings
// ================================

app.get("/api/bookings", async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }));
});

app.post("/api/booking", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking created", booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ================================
// Routes: Regions
// ================================

app.get("/api/regions", async (req, res) => {
  res.json(await Region.find());
});

// ================================
// Income Routes
// ================================

// Month names mapping
const monthMap = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

// -----------------------------------------------------------
// 🔥 NEW ROUTE: NUMERIC DATE SUPPORT (Frontend uses this)
// /api/income/2025/11/26
// -----------------------------------------------------------

app.get("/api/income/:year/:monthNum/:dayNum", async (req, res, next) => {
  if (isNaN(req.params.monthNum)) return next(); // pass to string route

  const year = Number(req.params.year);
  const month = Number(req.params.monthNum);
  const day = Number(req.params.dayNum);

  try {
    const income = await Income.findOne({ year, month, day });
    if (!income)
      return res.status(404).json({ message: `Income not found for ${year}-${month}-${day}` });

    res.json(income);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------------------------------------
// STRING MONTH ROUTES (existing logic)
// -----------------------------------------------------------

app.get("/api/income/:year/:month/:day", async (req, res) => {
  const { year, month, day } = req.params;

  const monthNum = monthMap[month.toLowerCase()];
  if (!monthNum)
    return res.status(400).json({ message: "Invalid month name" });

  const income = await Income.findOne({
    year: Number(year),
    month: monthNum,
    day: Number(day),
  });

  if (!income)
    return res.status(404).json({ message: "Income not found" });

  res.json(income);
});

// Add new income
app.post("/api/income", async (req, res) => {
  try {
    let { year, month, day, totalIncome } = req.body;

    if (typeof month === "string") {
      const lower = month.toLowerCase();
      if (!monthMap[lower])
        return res.status(400).json({ message: "Invalid month name" });
      month = monthMap[lower];
    }

    const income = new Income({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      totalIncome: Number(totalIncome),
    });

    await income.save();
    res.status(201).json({ message: "Income added", income });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Income already exists for this date" });
    }
    res.status(500).json({ message: "Error", error: error.message });
  }
});

// ================================
// Root
// ================================

app.get("/", (req, res) => {
  res.send("RentCar API is running");
});

// ================================
// Server Init
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running http://localhost:${PORT}`);

  if ((await Region.countDocuments()) === 0) {
    await Region.insertMany(regionsList.map((name) => ({ name })));
    console.log("Regions added");
  }
});
