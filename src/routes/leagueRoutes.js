import express from 'express';
import leagueController from '../controllers/leagueController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', authMiddleware, leagueController.getAllLeagues);

export default router;