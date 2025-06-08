import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/iracing-id', authMiddleware, userController.updateIracingId);
router.put('/avatar-url', authMiddleware, userController.updateAvatarUrl);

export default router;