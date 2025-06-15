import express from 'express';
import leagueController from '../controllers/leagueController.js';

const router = express.Router();

router.get('/all', leagueController.getAllLeagues);

export default router;