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

// createdAt → YYYY-MM-DD format
incomeSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.createdAt) {
      ret.createdAt = ret.createdAt.toISOString().split("T")[0];
    }
    return ret;
  },
});

const Income = mongoose.model("Income", incomeSchema);

// ================================
// Regions list for initial insert
// ================================

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

app.get("/api/cars/category/:category", async (req, res) => {
  const category = req.params.category.toLowerCase();
  const cars = await Car.find({
    category: { $regex: new RegExp("^" + category + "$", "i") },
  });
  if (!cars.length)
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
  const comments = await Comment.find({ carId: req.params.carId }).sort({
    createdAt: -1,
  });
  res.json(comments);
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
  res.json(await Booking.find().sort({ createdAt: -1 }));
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
// Routes: Regions
// ================================

app.get("/api/regions", async (req, res) => {
  res.json(await Region.find());
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

// ================================
// Routes: Income
// ================================

const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

// ---- Get year income ----
app.get("/api/income/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const incomes = await Income.find({ year }).sort({ month: 1, day: 1 });

    if (!incomes.length)
      return res.status(404).json({ message: `${year} yil uchun ma'lumot yo'q` });

    const grouped = {};
    incomes.forEach((inc) => {
      const monthName = Object.keys(monthMap).find(
        (key) => monthMap[key] === inc.month
      );
      if (!grouped[monthName]) grouped[monthName] = [];
      grouped[monthName].push(inc);
    });

    res.json({ year, incomesByMonth: grouped });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
});

// ---- Get month income ----
app.get("/api/income/:year/:month", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const monthNum = monthMap[req.params.month.toLowerCase()];
    if (!monthNum)
      return res.status(400).json({ message: "Oy nomi noto‘g‘ri" });

    const incomes = await Income.find({ year, month: monthNum }).sort({
      day: 1,
    });

    if (!incomes.length)
      return res.status(404).json({
        message: `${year}-${req.params.month} uchun daromad topilmadi`,
      });

    const totalMonthlyIncome = incomes.reduce(
      (sum, inc) => sum + inc.totalIncome,
      0
    );

    res.json({
      year,
      month: req.params.month.toLowerCase(),
      totalMonthlyIncome,
      dailyIncomes: incomes,
    });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
});

// ---- Get day income ----
app.get("/api/income/:year/:month/:day", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const monthNum = monthMap[req.params.month.toLowerCase()];
    const day = parseInt(req.params.day);

    if (!monthNum)
      return res.status(400).json({ message: "Oy nomi noto‘g‘ri" });

    const income = await Income.findOne({ year, month: monthNum, day });

    if (!income)
      return res.status(404).json({
        message: `${year}-${req.params.month}-${day} uchun daromad topilmadi`,
      });

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
});

// ---- Add income ----
app.post("/api/income", async (req, res) => {
  try {
    let { year, month, day, totalIncome } = req.body;

    if (!year || !month || !day || totalIncome === undefined)
      return res
        .status(400)
        .json({ message: "year, month, day va totalIncome kiritilishi shart" });

    if (typeof month === "string") {
      if (!monthMap[month.toLowerCase()])
        return res.status(400).json({ message: "Oy nomi noto‘g‘ri" });
      month = monthMap[month.toLowerCase()];
    }

    const income = new Income({ year, month, day, totalIncome });
    await income.save();
    res.status(201).json({ message: "Daromad qo‘shildi", income });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "Bu sana uchun daromad mavjud" });
    res.status(500).json({ message: "Xatolik yuz berdi" });
  }
});

// ---- UPDATE Income (frontend uchun kerak) ----
app.put("/api/income/:id", async (req, res) => {
  try {
    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedIncome)
      return res.status(404).json({ message: "Income not found" });

    res.json({
      message: "Income updated successfully",
      income: updatedIncome,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating income" });
  }
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
    console.log("✅ 12 ta viloyat qo‘shildi");
  }
});
