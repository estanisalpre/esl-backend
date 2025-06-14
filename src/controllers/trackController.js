import pool from '../db.js';

// creating a new track
async function createTrack(req, res) {
  try {
    const { name, corners, length_meters } = req.body;

    if (!name || !corners || !length_meters) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const [result] = await pool.query(`
      INSERT INTO tracks (name, corners, length_meters)
      VALUES (?, ?, ?)
    `, [name, corners, length_meters]);

    res.status(201).json({ message: 'Pista creada con éxito', track_id: result });
  } catch (err) {
    console.error('Error al crear la pista:', err);
    res.status(500).json({ message: 'Error interno al crear la pista.' });
  }
}

export default { createTrack };