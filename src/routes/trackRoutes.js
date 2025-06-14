import express from 'express';
import trackController from '../controllers/trackController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// post
router.post('/create', authMiddleware, trackController.createTrack);

export default router;