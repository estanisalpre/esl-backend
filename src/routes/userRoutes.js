import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// put
router.put('/iracing-id', authMiddleware, userController.updateIracingId);
router.put('/avatar-url', authMiddleware, userController.updateAvatarUrl);

// get
router.get('/:id/stats', authMiddleware, userController.getStats);

export default router;