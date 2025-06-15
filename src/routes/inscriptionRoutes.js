import express from 'express';
import inscriptionController from '../controllers/inscriptionsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// get
router.get("/check", inscriptionController.checkInscription);

// post
router.post("/join", authMiddleware, inscriptionController.joinLeague);

export default router;