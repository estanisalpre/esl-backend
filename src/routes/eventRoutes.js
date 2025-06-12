import express from 'express';
import eventController from '../controllers/eventController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// get
router.get('/all', authMiddleware, eventController.getAllEvents);
router.get('/user-events', authMiddleware, eventController.getUserEvents);

// post
router.post('/create', authMiddleware, eventController.createEvent);

export default router;