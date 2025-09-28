import express from 'express';
import monitorRoute from './routes/monitorRoute';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Register the monitorRoute router
app.use('/api', monitorRoute);

app.listen(8000, () => {
  console.log('🚀 Server running on http://localhost:8000');
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit();
});
