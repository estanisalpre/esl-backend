import express from 'express';
import multer from 'multer';
import leagueController from '../controllers/leagueController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// get
router.get('/all', leagueController.getAllLeagues);

// delete
/* router.delete('/delete/:id', authMiddleware, leagueController.deleteLeague); */

// put
/* router.put('/update/:id', authMiddleware, upload.single('image'), leagueController.updateLeague); */

export default router;