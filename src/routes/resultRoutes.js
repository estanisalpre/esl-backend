import express from 'express';
import multer from 'multer';
import authMiddleware from '../middlewares/authMiddleware.js';
import resultsController from '../controllers/resultController.js';

const router = express.Router();
const upload = multer(); 

router.post('/upload', authMiddleware, upload.single('file'), resultsController.uploadResults);

export default router;