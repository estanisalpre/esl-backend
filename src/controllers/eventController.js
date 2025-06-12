import pool from '../db.js';

// create new event
async function createEvent(req, res) {
  try {
    const { league_id, name, track_name, week_number, start_date } = req.body;

    if (!league_id || !name || !week_number || !start_date) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Lo comentado es por si queremos a futuro limitar la cantidad de eventos por liga
    // Por ejemplo: una liga de 1 evento.
    /* const [existing] = await pool.query(`
      SELECT id FROM events WHERE league_id = ? AND week_number = ?
    `, [league_id, week_number]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ya existe un evento para esta semana en esta liga' });
    } */

    const [result] = await pool.query(`
      INSERT INTO events (league_id, name, track_name, week_number, start_date)
      VALUES (?, ?, ?, ?, ?)
    `, [league_id, name, track_name, week_number, start_date]);

    const eventId = result.insertId;

    const sessionTypes = ['practice', 'qualify', 'race'];
    for (const type of sessionTypes) {
      await pool.query(`
        INSERT INTO sessions (event_id, session_type)
        VALUES (?, ?)
      `, [eventId, type]);
    }

    res.status(201).json({ message: 'Evento y sesiones creadas con éxito', event_id: eventId });
  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ message: 'Error interno al crear el evento' });
  }
}

// get all the events
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

// get all the events of the user
async function getUserEvents(req, res) {
  try {
    const userId = req.user.id;

    const [events] = await pool.query(
      `SELECT e.*
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       WHERE er.user_id = ?`,
      [userId]
    );

    res.status(200).json({ events });
  } catch (err) {
    console.error('Error al obtener eventos del usuario:', err);
    res.status(500).json({ message: 'Error interno al obtener los eventos del usuario' });
  }
}

export default { getAllEvents, createEvent, getUserEvents };