import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import referralRoutes from './routes/referrals.js';
import { startReferralStatusWorker } from './jobs/referralStatusWorker.js';
import { graph } from './utils/hospitals.js';
import { routingMetrics } from './utils/dijkstra.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);

app.get('/routing-metrics', (req, res) => {
  try {
    const nodes = Object.keys(graph).length;
    let edges = 0;
    for (const node of Object.keys(graph)) {
      edges += Object.keys(graph[node]).length;
    }
    res.json({
      nodes,
      edges,
      lastComputationMs: routingMetrics.lastComputationMs,
      executionsToday: routingMetrics.executionsToday
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute metrics" });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rural-referral';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const stopWorker = startReferralStatusWorker();
    console.log('Referral status worker started');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      stopWorker();
      process.exit(0);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
