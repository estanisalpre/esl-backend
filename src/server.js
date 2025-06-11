import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// import routes
import authRoutes from './routes/authRoutes.js';
import indexRoute from './routes/indexRoute.js';
import userRoutes from './routes/userRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import leagueRoutes from './routes/leagueRoutes.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Middlewares
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

// Rutas REST
app.use('/', indexRoute);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/result', resultRoutes);
app.use('/event', eventRoutes);
app.use('/league', leagueRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
