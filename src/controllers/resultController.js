import pool from '../db.js';

function calcularPuntos(pos) {
  const tabla = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  return pos < tabla.length ? tabla[pos] : 0;
}

async function uploadResults(req, res) {
  const sessionType = req.body.sessionType;
  const eventId = req.body.eventId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Archivo no recibido' });
  }

  if (!sessionType || !['practice', 'qualify', 'race'].includes(sessionType)) {
    return res.status(400).json({ message: 'Tipo de sesión inválido' });
  }

  if (!eventId) {
    return res.status(400).json({ message: 'ID del evento requerido' });
  }

  try {
    const jsonBuffer = file.buffer.toString('utf-8');
    const data = JSON.parse(jsonBuffer);

    const subsessionId = data.subsession_id;
    const startTime = data.start_time || new Date();

    // Verificar si ya existe la sesión
    const [existing] = await pool.query(
      'SELECT id FROM sessions WHERE subsession_id = ?',
      [subsessionId]
    );

    let sessionId;
    if (existing.length > 0) {
      sessionId = existing[0].id;
    } else {
      const [insert] = await pool.query(
        'INSERT INTO sessions (event_id, session_type, subsession_id, start_time) VALUES (?, ?, ?, ?)',
        [eventId, sessionType, subsessionId, startTime]
      );
      sessionId = insert.insertId;
    }

    // Procesar resultados
    const results = data?.data?.session_results?.[0]?.results;
    if (!results || results.length === 0) {
      return res.status(400).json({ message: 'No hay resultados en el archivo' });
    }

    for (const piloto of results) {
      const { cust_id, finish_position, laps_complete, incidents, best_lap_time, oldi_rating, newi_rating } = piloto;

      const [userRes] = await pool.query('SELECT id FROM users WHERE iracing_cust_id = ?', [cust_id]);
      if (userRes.length === 0) continue; 

      const userId = userRes[0].id;
      const puntos = sessionType === 'race' ? calcularPuntos(finish_position) : 0;

      await pool.query(
        `INSERT INTO session_results (
          session_id, user_id, finish_position, laps_complete, incidents,
          best_lap_time, old_i_rating, new_i_rating, points_earned
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          userId,
          finish_position,
          laps_complete,
          incidents,
          best_lap_time || 0,
          oldi_rating,
          newi_rating,
          puntos
        ]
      );
    }

    return res.status(200).json({ message: `Resultados de ${sessionType} cargados con éxito.` });
  } catch (err) {
    console.error('Error al procesar resultados:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export default { uploadResults };
