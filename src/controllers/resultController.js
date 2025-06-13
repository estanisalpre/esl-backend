import pool from '../db.js';

// función de puntos al estilo F1, ajustada a posición base 0
function calcularPuntos(pos) {
  if (pos < 0) return 0;
  const tabla = {
    0: 25, 1: 20, 2: 18, 3: 16, 4: 14,
    5: 12, 6: 10, 7: 8, 8: 4, 9: 2, 10: 1
  };
  if (tabla[pos] !== undefined) return tabla[pos];
  if (pos >= 11 && pos <= 15) return 1;
  return 0;
}

// Endpoint para subir resultados y actualizar rankings y estadísticas
async function uploadResults(req, res) {
  const { sessionType, eventId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Archivo no recibido' });
  if (!eventId || !['practice','qualify','race'].includes(sessionType)) {
    return res.status(400).json({ message: 'Tipo de sesión o evento inválido' });
  }

  try {
    const data = JSON.parse(file.buffer.toString('utf-8'));
    const subsessionId = data.subsession_id;

    // Validar tipo de sesión contra el JSON cargado
    const sessionName = sessionType.toUpperCase();

    console.log(sessionName);

    const sessionData = data.data.session_results.find(s => s.simsession_name === sessionName);

    console.log(sessionData)
    if (!sessionData) {
      return res.status(400).json({ message: `No se encontró la sesión '${sessionName}' en el archivo` });
    }
    const raceResults = sessionData.results || [];

    // Crear/obtener sesión
    const [exist] = await pool.query(
      'SELECT id FROM sessions WHERE subsession_id = ?', [subsessionId]
    );
    let sessionId = exist[0]?.id;
    if (!sessionId) {
      const [ins] = await pool.query(
        `INSERT INTO sessions 
         (event_id, session_type, subsession_id, start_time, end_time)
         VALUES (?, ?, ?, ?, ?)`,
        [eventId, sessionType, subsessionId,
         new Date(), data.end_time || new Date()]
      );
      sessionId = ins.insertId;
    }

    // Obtener liga y temporada activa
    const [[{ league_id }]] = await pool.query(
      `SELECT league_id FROM events WHERE id = ?`, [eventId]
    );
    const [[seasonRes]] = await pool.query(
      `SELECT id AS season_id FROM seasons WHERE league_id = ? AND end_date IS NULL`,
      [league_id]
    );
    if (!seasonRes) {
      return res.status(400).json({ message: 'No hay temporada activa para esta liga' });
    }
    const season_id = seasonRes.season_id;

    for (const p of raceResults) {
      const pos = Number(p.finish_position);
      const puntosGanados = calcularPuntos(pos);

      const [u] = await pool.query(
        'SELECT id FROM users WHERE iracing_cust_id = ?', [p.cust_id]
      );
      if (!u[0]) continue;
      const userId = u[0].id;

      const [lr] = await pool.query(
        `SELECT total_points, total_races, average_finish
           FROM league_rankings
          WHERE league_id = ? AND season_id = ? AND user_id = ?`,
        [league_id, season_id, userId]
      );
      const oldPoints = lr[0]?.total_points || 0;
      const newPoints = oldPoints + puntosGanados;

      await pool.query(
        `INSERT INTO session_results
         (session_id,user_id,finish_position,laps_complete,
          incidents,best_lap_time,old_i_rating,new_i_rating,
          points_earned,old_points,new_points)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [sessionId, userId, pos, p.laps_complete, 0,
         p.best_lap_time > 0 ? p.best_lap_time : null,
         null, null,
         puntosGanados, oldPoints, newPoints]
      );

      if (lr.length) {
        const newTotalRaces = lr[0].total_races + 1;
        const newAvg = ((lr[0].average_finish * lr[0].total_races) + pos) / newTotalRaces;
        await pool.query(
          `UPDATE league_rankings
           SET total_points = ?, total_races = ?, average_finish = ?
           WHERE league_id = ? AND season_id = ? AND user_id = ?`,
          [newPoints, newTotalRaces, newAvg, league_id, season_id, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO league_rankings
           (season_id,league_id,user_id,total_points,total_races,average_finish)
           VALUES (?,?,?,?,1,?)`,
          [season_id, league_id, userId, newPoints, pos]
        );
      }

      const isPole = pos === 0 ? 1 : 0;
      const isPodium = pos >= 0 && pos <= 2 ? 1 : 0;
      const isWin = pos === 0 ? 1 : 0;
      await pool.query(
        `INSERT INTO user_stats
         (user_id,races_participated,poles,podiums,wins)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           races_participated = races_participated + 1,
           poles = poles + ?,
           podiums = podiums + ?,
           wins = wins + ?`,
        [userId, 1, isPole, isPodium, isWin, isPole, isPodium, isWin]
      );
    }

    return res.status(200).json({ message: `Resultados de ${sessionType} cargados correctamente.` });
  } catch (err) {
    console.error('Error al procesar resultados:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export default { uploadResults };