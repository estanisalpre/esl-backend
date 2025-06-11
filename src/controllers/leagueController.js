import pool from '../db.js';

// get all the leagues
async function getAllLeagues(req, res) {
    try {
        const [leagues] = await pool.query(`
            SELECT * FROM leagues
        `);
        res.status(200).json({ leagues });
    } catch (err) {
        console.error('Error al obtener ligas:', err);
        res.status(500).json({ message: 'Error interno al obtener las ligas' });
    }
}

export default { getAllLeagues };