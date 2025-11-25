// ================================
// Rent Car API Server (MongoDB bilan) — Fixed
// Built with Node.js + Express + Mongoose
// ================================

require('dotenv').config(); // ensure you have a .env with MONGO_URI
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------
// Helper: async wrapper for routes
// -------------------------------
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// -------------------------------
// MongoDB Connection
// -------------------------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set. Put it into a .env file or environment variables');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI, {
    // these options are safe defaults for most mongoose versions
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// -------------------------------
// Models
// -------------------------------
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
const Car = mongoose.model('Car', carSchema);

const commentSchema = new mongoose.Schema({
  carId: mongoose.Schema.Types.ObjectId,
  author: { type: String, default: 'Anonymous' },
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema);

const bookingSchema = new mongoose.Schema({
  carType: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  placeOfRental: String,
  placeOfReturn: String,
  rentalDate: Date,
  returnDate: Date,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model('Booking', bookingSchema);

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
const Region = mongoose.model('Region', regionSchema);

// -------------------------------
// Income Schema
// -------------------------------
const incomeSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  totalIncome: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

incomeSchema.index({ year: 1, month: 1, day: 1 }, { unique: true });

// JSON formatda createdAt ni faqat YYYY-MM-DD shaklida chiqarish
incomeSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt) {
      // ensure createdAt is ISO date string YYYY-MM-DD
      ret.createdAt = new Date(ret.createdAt).toISOString().split('T')[0];
    }
    return ret;
  },
});

const Income = mongoose.model('Income', incomeSchema);

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

// -------------------------------
// Utilities
// -------------------------------
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

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -------------------------------
// Routes: Cars
// -------------------------------

app.get('/api/cars', asyncHandler(async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
}));

app.get('/api/cars/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid car id' });
  const car = await Car.findById(id);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  res.json(car);
}));

app.get('/api/cars/category/:category', asyncHandler(async (req, res) => {
  const category = req.params.category.toLowerCase();
  const cars = await Car.find({
    category: { $regex: new RegExp('^' + category + '$', 'i') },
  });
  if (cars.length === 0) return res.status(404).json({ message: 'No cars found in this category' });
  res.json(cars);
}));

app.post('/api/cars', asyncHandler(async (req, res) => {
  const newCar = new Car(req.body);
  await newCar.save();
  res.status(201).json(newCar);
}));

app.put('/api/cars/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid car id' });
  const updated = await Car.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Car not found' });
  res.json(updated);
}));

app.delete('/api/cars/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid car id' });
  const deleted = await Car.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Car not found' });
  res.json({ message: 'Car deleted successfully' });
}));

// -------------------------------
// Routes: Comments
// -------------------------------

app.get('/api/comments/car/:carId', asyncHandler(async (req, res) => {
  const { carId } = req.params;
  if (!isObjectId(carId)) return res.status(400).json({ message: 'Invalid car id' });
  const carComments = await Comment.find({ carId }).sort({ createdAt: -1 });
  res.json(carComments);
}));

app.post('/api/comments', asyncHandler(async (req, res) => {
  const comment = new Comment(req.body);
  await comment.save();
  res.status(201).json(comment);
}));

app.put('/api/comments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid comment id' });
  const updated = await Comment.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Comment not found' });
  res.json(updated);
}));

app.delete('/api/comments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid comment id' });
  const deleted = await Comment.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Comment not found' });
  res.json({ message: 'Comment deleted successfully' });
}));

// -------------------------------
// Routes: Bookings
// NOTE: POST path standardized to /api/bookings (previously /api/booking)
// -------------------------------

app.get('/api/bookings', asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).populate('carType');
  res.json(bookings);
}));

app.post('/api/bookings', asyncHandler(async (req, res) => {
  const payload = req.body;
  // Basic validation
  if (!payload.carType || !isObjectId(payload.carType))
    return res.status(400).json({ message: 'carType (car id) is required and must be a valid id' });

  const booking = new Booking(payload);
  await booking.save();
  res.status(201).json({ message: '✅ Booking created successfully', booking });
}));

app.put('/api/bookings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid booking id' });
  const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Booking not found' });
  res.json(updated);
}));

app.delete('/api/bookings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid booking id' });
  const deleted = await Booking.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Booking not found' });
  res.json({ message: 'Booking deleted successfully' });
}));

// -------------------------------
// Routes: Regions
// -------------------------------

app.get('/api/regions', asyncHandler(async (req, res) => {
  const regions = await Region.find();
  res.json(regions);
}));

app.post('/api/regions', asyncHandler(async (req, res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    res.status(201).json(region);
  } catch (err) {
    res.status(400).json({ message: 'Error adding region', error: err.message });
  }
}));

// -------------------------------
// Routes: Income
// -------------------------------

// Yearly incomes grouped by month name
app.get('/api/income/:year', asyncHandler(async (req, res) => {
  const { year } = req.params;
  const y = parseInt(year, 10);
  if (Number.isNaN(y)) return res.status(400).json({ message: 'Invalid year' });

  const incomes = await Income.find({ year: y }).sort({ month: 1, day: 1 });
  if (!incomes.length) return res.status(404).json({ message: `${y} yil uchun ma'lumot yo'q` });

  const grouped = {};
  incomes.forEach((inc) => {
    const monthName = Object.keys(monthMap).find((key) => monthMap[key] === inc.month) || String(inc.month);
    if (!grouped[monthName]) grouped[monthName] = [];
    grouped[monthName].push(inc);
  });

  res.json({ year: y, incomesByMonth: grouped });
}));

// Monthly incomes by month name
app.get('/api/income/:year/:month', asyncHandler(async (req, res) => {
  const { year, month } = req.params;
  const y = parseInt(year, 10);
  if (Number.isNaN(y)) return res.status(400).json({ message: 'Invalid year' });

  const monthNum = monthMap[month.toLowerCase()];
  if (!monthNum) return res.status(400).json({ message: "Oy nomi noto‘g‘ri kiritilgan" });

  const incomes = await Income.find({ year: y, month: monthNum }).sort({ day: 1 });
  if (!incomes.length) return res.status(404).json({ message: `${y}-${month} uchun daromad topilmadi` });

  const totalMonthlyIncome = incomes.reduce((sum, inc) => sum + inc.totalIncome, 0);
  res.json({ year: y, month: month.toLowerCase(), totalMonthlyIncome, dailyIncomes: incomes });
}));

// Daily income
app.get('/api/income/:year/:month/:day', asyncHandler(async (req, res) => {
  const { year, month, day } = req.params;
  const y = parseInt(year, 10);
  const d = parseInt(day, 10);
  if (Number.isNaN(y) || Number.isNaN(d)) return res.status(400).json({ message: 'Invalid year or day' });

  const monthNum = monthMap[month.toLowerCase()];
  if (!monthNum) return res.status(400).json({ message: "Oy nomi noto‘g‘ri kiritilgan" });

  const income = await Income.findOne({ year: y, month: monthNum, day: d });
  if (!income) return res.status(404).json({ message: `${y}-${month}-${d} uchun daromad topilmadi` });
  res.json(income);
}));

// Create income entry. Accepts month as string or number.
app.post('/api/income', asyncHandler(async (req, res) => {
  let { year, month, day, totalIncome } = req.body;
  if (year === undefined || month === undefined || day === undefined || totalIncome === undefined)
    return res.status(400).json({ message: 'year, month, day va totalIncome kiritilishi shart' });

  // normalize numeric types
  year = parseInt(year, 10);
  day = parseInt(day, 10);
  totalIncome = Number(totalIncome);

  if (typeof month === 'string') {
    const lower = month.toLowerCase();
    if (!monthMap[lower]) return res.status(400).json({ message: 'Oy nomi noto‘g‘ri' });
    month = monthMap[lower];
  } else {
    month = parseInt(month, 10);
  }

  if ([year, month, day].some((n) => Number.isNaN(n)))
    return res.status(400).json({ message: 'year, month yoki day noto‘g‘ri formatda' });

  const income = new Income({ year, month, day, totalIncome });
  try {
    await income.save();
    res.status(201).json({ message: '✅ Daromad qo‘shildi', income });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'Bu sana uchun daromad allaqachon mavjud' });
    throw error; // will be handled by error handler
  }
}));

// -------------------------------
// Root Route
// -------------------------------
app.get('/', (req, res) => {
  res.send('🚗 RentCar API is running successfully!');
});

// -------------------------------
// Global error handler
// -------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// -------------------------------
// Server start
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚗 RentCar API Server running on http://localhost:${PORT}`);

  try {
    const count = await Region.countDocuments();
    if (count === 0) {
      await Region.insertMany(regionsList.map((name) => ({ name })));
      console.log("✅ 12 ta viloyat dastlabki ma'lumot sifatida qo‘shildi");
    }
  } catch (err) {
    console.error('Error ensuring initial regions:', err.message);
  }
});
