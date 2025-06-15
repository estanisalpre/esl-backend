// controllers/inscriptionController.js
import pool from '../db.js';

// verify if a user is registered in a league
async function checkInscription(req, res) {
  try {
    const { user_id, league_id } = req.query;

    const [rows] = await pool.query(
      "SELECT id FROM inscriptions WHERE user_id = ? AND league_id = ?",
      [user_id, league_id]
    );

    res.status(200).json({ isRegistered: rows.length > 0 });
  } catch (err) {
    console.error('Error al verificar inscripción:', err);
    res.status(500).json({ message: 'Error interno al verificar inscripción' });
  }
}

// register an user to a league and all its events
async function joinLeague(req, res) {
  try {
    const { user_id, league_id } = req.body;

    // Verificar si ya está inscripto en la liga
    const [exists] = await pool.query(
      "SELECT id FROM inscriptions WHERE user_id = ? AND league_id = ?",
      [user_id, league_id]
    );

    if (exists.length > 0) {
      return res.status(409).json({ message: "Ya estás inscripto" });
    }

    // Verificar cupos
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM inscriptions WHERE league_id = ?",
      [league_id]
    );

    const [[{ max_participants }]] = await pool.query(
      "SELECT max_participants FROM leagues WHERE id = ?",
      [league_id]
    );

    if (count >= max_participants) {
      return res.status(400).json({ message: "No hay más cupos disponibles" });
    }

    // Insertar en inscriptions
    await pool.query(
      "INSERT INTO inscriptions (user_id, league_id) VALUES (?, ?)",
      [user_id, league_id]
    );

    // Obtener eventos de la liga
    const [events] = await pool.query(
      "SELECT id FROM events WHERE league_id = ?",
      [league_id]
    );

    // Registrar al usuario en cada evento (evitando duplicados)
    for (const event of events) {
      const [alreadyRegistered] = await pool.query(
        "SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?",
        [user_id, event.id]
      );

      if (alreadyRegistered.length === 0) {
        await pool.query(
          "INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)",
          [user_id, event.id]
        );
      }
    }

    res.status(200).json({ message: "Inscripción exitosa" });
  } catch (err) {
    console.error("Error al inscribirse:", err);
    res.status(500).json({ message: "Error interno al realizar la inscripción" });
  }
}

export default {
  checkInscription,
  joinLeague,
};
