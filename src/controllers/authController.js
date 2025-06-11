import bcrypt from 'bcrypt';
import pool from '../db.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/tokenUtils.js';
import { avatar_base_64 } from '../avatar-data.js';

// DEFAULT AVATAR - base64
const defaultAvatarBase64 = avatar_base_64;

// register new user
async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const role = 'racer';
    
    const [insertResult] = await pool.query(
      'INSERT INTO users (username, email, password, avatar_url, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashed, defaultAvatarBase64, role]
    );

    const user = {
      id: insertResult.insertId, 
      username,
      email,
      role,
    };

    const access_token  = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado',
      data: {
        access_token,
        refresh_token,
        user
      }
    });
  } catch (err) {
    console.error('Error en register controller:', err);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor durante el registro'
    });
  }
}

// login user
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        access_token,
        refresh_token,
        user: {  
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar_url,
          iracing_id: user.iracing_cust_id,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

function refreshTokenHandler(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = verifyToken(refresh_token);
    const newAccessToken = generateAccessToken(decoded);
    res.json({ access_token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}

export default { register, login, refreshTokenHandler };
