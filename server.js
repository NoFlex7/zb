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

app.put("/api/comments/:id", async (req, res) => {
  const updated = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Comment not found" });
  res.json(updated);
});

app.delete("/api/comments/:id", async (req, res) => {
  const deleted = await Comment.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Comment not found" });
  res.json({ message: "Comment deleted successfully" });
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

app.put("/api/bookings/:id", async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Booking not found" });
  res.json(updated);
});

app.delete("/api/bookings/:id", async (req, res) => {
  const deleted = await Booking.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Booking not found" });
  res.json({ message: "Booking deleted successfully" });
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

app.put("/api/regions/:id", async (req, res) => {
  const updated = await Region.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "Region not found" });
  res.json(updated);
});

app.delete("/api/regions/:id", async (req, res) => {
  const deleted = await Region.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Region not found" });
  res.json({ message: "Region deleted successfully" });
});

// ================================
// Static Route: Income (Oylik daromadlar)
// ================================

let incomes = [
  { month: "Yanvar", totalIncome: 12000000 },
  { month: "Fevral", totalIncome: 9500000 },
  { month: "Mart", totalIncome: 14300000 },
  { month: "Aprel", totalIncome: 10200000 },
  { month: "May", totalIncome: 17800000 },
  { month: "Iyun", totalIncome: 16500000 },
  { month: "Iyul", totalIncome: 19500000 },
  { month: "Avgust", totalIncome: 18600000 },
  { month: "Sentyabr", totalIncome: 15200000 },
  { month: "Oktyabr", totalIncome: 16100000 },
  { month: "Noyabr", totalIncome: 17400000 },
  { month: "Dekabr", totalIncome: 21000000 },
];

// Barcha oylik daromadlarni olish
app.get("/api/income", (req, res) => {
  res.json(incomes);
});

// Bitta oy daromadini olish
app.get("/api/income/:month", (req, res) => {
  const monthName = req.params.month;
  const month = incomes.find(
    (m) => m.month.toLowerCase() === monthName.toLowerCase()
  );
  if (!month)
    return res
      .status(404)
      .json({ message: `${monthName} oyi uchun ma'lumot topilmadi` });
  res.json(month);
});

// Oyni yangilash (PUT)
app.put("/api/income/:month", (req, res) => {
  const monthName = req.params.month;
  const index = incomes.findIndex(
    (m) => m.month.toLowerCase() === monthName.toLowerCase()
  );
  if (index === -1)
    return res
      .status(404)
      .json({ message: `${monthName} oyi uchun ma'lumot topilmadi` });
  incomes[index] = { ...incomes[index], ...req.body };
  res.json(incomes[index]);
});

// Oyni o‘chirish (DELETE)
app.delete("/api/income/:month", (req, res) => {
  const monthName = req.params.month;
  const index = incomes.findIndex(
    (m) => m.month.toLowerCase() === monthName.toLowerCase()
  );
  if (index === -1)
    return res
      .status(404)
      .json({ message: `${monthName} oyi uchun ma'lumot topilmadi` });
  incomes.splice(index, 1);
  res.json({ message: `${monthName} oyi daromadi o‘chirildi` });
});
app.post("/api/income", (req, res) => {
  const { month, totalIncome } = req.body;

  if (!month || !totalIncome) {
    return res.status(400).json({ message: "Month va totalIncome kiritilishi shart" });
  }

  // Agar oylik ma'lumot oldin mavjud bo'lsa, xatolik yuborish
  const existing = incomes.find(
    (m) => m.month.toLowerCase() === month.toLowerCase()
  );
  if (existing) {
    return res
      .status(400)
      .json({ message: `${month} oyi uchun ma'lumot allaqachon mavjud` });
  }

  const newIncome = { month, totalIncome };
  incomes.push(newIncome);
  res.status(201).json({ message: "✅ Income qo'shildi", income: newIncome });
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

  const count = await Region.countDocuments();
  if (count === 0) {
    await Region.insertMany(regionsList.map((name) => ({ name })));
    console.log("✅ 12 ta viloyat dastlabki ma'lumot sifatida qo'shildi");
  }
});
