const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    seedAdmin();
    seedScreens();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

const Admin  = require('./models/Admin');
const Screen = require('./models/Screen');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existing) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await Admin.create({ name: 'Super Admin', email: process.env.ADMIN_EMAIL, password: hashed, role: 'superadmin' });
      console.log('✅ Admin seeded:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin already exists');
    }
  } catch (err) { console.error('Seed error:', err); }
}

async function seedScreens() {
  try {
    const count = await Screen.countDocuments();
    if (count === 0) {
      await Screen.insertMany([
        { name: 'Screen 1', totalSeats: 80,  rows: 8, seatsPerRow: 10, formats: ['2D','3D'] },
        { name: 'Screen 2', totalSeats: 60,  rows: 6, seatsPerRow: 10, formats: ['2D','IMAX'] },
        { name: 'Screen 3', totalSeats: 40,  rows: 4, seatsPerRow: 10, formats: ['2D'] },
      ]);
      console.log('✅ Screens seeded');
    }
  } catch (err) { console.error('Screen seed error:', err); }
}

// ── Admin routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/movies',    require('./routes/movies'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/shows',     require('./routes/shows'));
app.use('/api/screens',   require('./routes/screens'));
app.use('/api/offers',    require('./routes/offers'));    // ← ADDED
app.use('/api/seat-layouts', require('./routes/seatLayouts'));

// ── User-facing routes
app.use('/api/user',   require('./routes/userAuth'));
app.use('/api/public', require('./routes/public'));

app.get('/', (req, res) => res.json({ message: 'CineBook API Running 🎬' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));