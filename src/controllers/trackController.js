import pool from '../db.js';

// creating a new track
async function createTrack(req, res) {
    try {
      const { name, corners, length_meters } = req.body;
      const imageFile = req.file;

      if (!name || !corners || !length_meters) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      let base64Image = null;
      if (imageFile) {
        base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
      }

      const [result] = await pool.query(
        `INSERT INTO tracks (name, corners, length_meters, image_base64)
         VALUES (?, ?, ?, ?)`,
        [name, corners, length_meters, base64Image]
      );

      res.status(201).json({ message: 'Pista creada con éxito', track_id: result.insertId });
    } catch (err) {
      console.error('Error al crear la pista:', err);
      res.status(500).json({ message: 'Error interno al crear la pista.' });
  }
}

// get all the tracks
async function getAllTracks(req, res) {
  try {
    const [tracks] = await pool.query(`SELECT * FROM tracks`);

    res.status(200).json({ tracks });
  } catch (err) {
    console.error('Error al obtener las pistas:', err);
    res.status(500).json({ message: 'Error interno al obtener las pistas' });
  }
}

export default { createTrack, getAllTracks };