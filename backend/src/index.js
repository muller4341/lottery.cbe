// Main server entry
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const prisma = require('./lib/prisma');
const { ensureDefaults } = require('./controllers/sites.controller');

const authRoutes = require('./routes/auth.routes');
const sitesRoutes = require('./routes/sites.routes');
const housesRoutes = require('./routes/houses.routes');
const applicantsRoutes = require('./routes/applicants.routes');
const lotteryRoutes = require('./routes/lottery.routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/houses', housesRoutes);
app.use('/api/applicants', applicantsRoutes);
app.use('/api/lottery', lotteryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('error:', err);
  res.status(err.status || 500).json({ ok: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    await ensureDefaults();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
