import express from 'express';
import eventController from '../controllers/eventController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// get
router.get('/all', eventController.getAllEvents);
router.get('/user-events', authMiddleware, eventController.getUserEvents);

// post
router.post('/create', authMiddleware, eventController.createEvent);

// delete
router.delete('/delete/:id', authMiddleware, eventController.deleteEvent);

// put
router.put('/update/:id', authMiddleware, eventController.updateEvent);

export default router;