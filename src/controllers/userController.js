import pool from "../db.js";

async function getStats(req, res) {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ message: 'User ID inválido' });

  try {
    // 1) Estadísticas generales
    const [[generalStats]] = await pool.query(
      `SELECT
        COUNT(sr.id) AS total_participaciones,
        COALESCE(SUM(sr.points_earned),0) AS total_puntos,
        SUM(CASE WHEN s.session_type='race' AND sr.finish_position=1 THEN 1 ELSE 0 END) AS victorias,
        SUM(CASE WHEN s.session_type='race' AND sr.finish_position <= 3 AND sr.finish_position > 0 THEN 1 ELSE 0 END) AS podiums,
        SUM(CASE WHEN s.session_type='qualify' AND sr.finish_position=1 THEN 1 ELSE 0 END) AS poles,
        SUM(CASE WHEN s.session_type='practice' THEN 1 ELSE 0 END) AS practices_participated,
        SUM(CASE WHEN s.session_type='qualify' THEN 1 ELSE 0 END) AS qualifies_participated,
        SUM(CASE WHEN s.session_type='race' THEN 1 ELSE 0 END) AS races_participated
      FROM session_results sr
      JOIN sessions s ON s.id = sr.session_id
      WHERE sr.user_id = ?`,
      [userId]
    );

    // Extra: temporadas únicas desde league_rankings
    const [[{ seasons_participated }]] = await pool.query(
      `SELECT COUNT(DISTINCT season_id) AS seasons_participated
       FROM league_rankings
       WHERE user_id = ?`,
      [userId]
    );

    generalStats.seasons_participated = seasons_participated;
    //console.log('generalStats:', generalStats);

    // 2) Mejor posición en ranking por temporada y ligas ganadas
    const [[rankStats]] = await pool.query(
      `SELECT
         MIN(ranking_pos) AS best_championship_rank,
         SUM(CASE WHEN ranking_pos = 1 THEN 1 ELSE 0 END) AS leagues_won
       FROM (
         SELECT lr.season_id,
                lr.league_id,
                ROW_NUMBER() OVER (
                  PARTITION BY lr.season_id 
                  ORDER BY lr.total_points DESC
                ) AS ranking_pos
         FROM league_rankings lr
         WHERE lr.user_id = ?
       ) t`,
      [userId]
    );

    //console.log('rankStats:', rankStats);

    // 3) Participaciones por liga
    const [ligas] = await pool.query(
      `SELECT
         l.id,
         l.name,
         COUNT(sr.id) AS participaciones
       FROM session_results sr
       JOIN sessions s ON s.id = sr.session_id
       JOIN events e ON e.id = s.event_id
       JOIN leagues l ON l.id = e.league_id
       WHERE sr.user_id = ?
       GROUP BY l.id, l.name`,
      [userId]
    );

    //console.log('ligas:', ligas);

    // Respuesta final
    res.status(200).json({
      general: generalStats || {},
      ranking: rankStats || {},
      ligas: ligas || []
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function updateAvatarUrl(req, res) {
  const userId = req.user.id;
  const { avatar_base64 } = req.body;

  if (
    !avatar_base64 ||
    typeof avatar_base64 !== "string" ||
    !avatar_base64.startsWith("data:image/")
  ) {
    return res
      .status(400)
      .json({ message: "Imagen inválida o no proporcionada" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatar_base64, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ avatar_url: avatar_base64 });
  } catch (err) {
    console.error("Error al actualizar la URL del avatar:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function updateIracingId(req, res) {
  const userId = req.user.id;
  const { iracing_cust_id } = req.body;

  if (!iracing_cust_id || isNaN(iracing_cust_id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET iracing_cust_id = ? WHERE id = ?",
      [iracing_cust_id, userId]
    );

    return res
      .status(200)
      .json({ message: "iRacing ID actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar iracing ID:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export default { updateIracingId, updateAvatarUrl, getStats };
