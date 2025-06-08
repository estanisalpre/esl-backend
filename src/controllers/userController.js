import pool from "../db.js";

async function getStats(req, res) {
  const userId = req.params.id;

  try {
    const [general] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_participaciones,
        SUM(points_earned) AS total_puntos,
        SUM(CASE WHEN finish_position = 0 AND s.session_type = 'race' THEN 1 ELSE 0 END) AS victorias
      FROM session_results r
      JOIN sessions s ON r.session_id = s.id
      WHERE r.user_id = ?
    `,
      [userId]
    );

    const [ligas] = await pool.query(
      `
      SELECT l.id, l.name, COUNT(*) AS participaciones
      FROM session_results r
      JOIN sessions s ON r.session_id = s.id
      JOIN events e ON s.event_id = e.id
      JOIN leagues l ON e.league_id = l.id
      WHERE r.user_id = ?
      GROUP BY l.id
    `,
      [userId]
    );

    res.status(200).json({
      general: general[0],
      ligas,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
    res.status(500).json({ message: "Error interno del servidor" });
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
