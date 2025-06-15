import jwt from 'jsonwebtoken';

const SECRET = 'supersecreto'; // ⚠️ Usar process.env.JWT_SECRET en producción

export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '60m' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
