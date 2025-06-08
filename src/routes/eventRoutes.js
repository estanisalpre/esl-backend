import express from 'express';
import eventController from '../controllers/eventController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', authMiddleware, eventController.getAllEvents);

export default router;