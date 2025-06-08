import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Conectado al servidor. ¡Todo ok!');
});

export default router;
