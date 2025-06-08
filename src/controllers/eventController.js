import pool from '../db.js';

async function getAllEvents(req, res) {
  try {
    const [events] = await pool.query(`
      SELECT 
        e.id, 
        e.name, 
        e.track_name, 
        e.week_number, 
        e.start_date,
        l.name as league_name
      FROM events e
      JOIN leagues l ON e.league_id = l.id
      ORDER BY e.week_number ASC
    `);

    res.status(200).json({ events });
  } catch (err) {
    console.error('Error al obtener eventos:', err);
    res.status(500).json({ message: 'Error interno al obtener los eventos' });
  }
}

export default { getAllEvents };