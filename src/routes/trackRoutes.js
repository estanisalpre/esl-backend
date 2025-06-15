import express from 'express';
import multer from 'multer';
import trackController from '../controllers/trackController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//get
router.get('/all', authMiddleware, trackController.getAllTracks);

// post
router.post('/create', authMiddleware, upload.single('image'), trackController.createTrack);

export default router;