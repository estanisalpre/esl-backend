import pool from '../db.js';

async function updateAvatarUrl(req, res) {
  const userId = req.user.id; 
  const { avatar_base64 } = req.body;

  if (!avatar_base64 || typeof avatar_base64 !== 'string' || !avatar_base64.startsWith('data:image/')) {
    return res.status(400).json({ message: 'Imagen inválida o no proporcionada' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatar_base64, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ avatar_url: avatar_base64 });
  } catch (err) {
    console.error('Error al actualizar la URL del avatar:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function updateIracingId(req, res) {
  const userId = req.user.id; 
  const { iracing_cust_id } = req.body;

  if (!iracing_cust_id || isNaN(iracing_cust_id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET iracing_cust_id = ? WHERE id = ?',
      [iracing_cust_id, userId]
    );

    return res.status(200).json({ message: 'iRacing ID actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar iracing ID:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export default { updateIracingId, updateAvatarUrl };