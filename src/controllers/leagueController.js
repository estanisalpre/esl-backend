import pool from '../db.js';

// get all the leagues
async function getAllLeagues(req, res) {
  try {
    const [leagues] = await pool.query(`SELECT * FROM leagues`);
    const [events] = await pool.query(`SELECT * FROM events ORDER BY week_number ASC`);
    const [inscriptions] = await pool.query(`SELECT league_id, COUNT(*) as count FROM inscriptions GROUP BY league_id`);

    const inscriptionMap = {};
    for (const ins of inscriptions) {
      inscriptionMap[ins.league_id] = ins.count;
    }
    
    const leaguesWithEvents = leagues.map((league) => {
      const leagueEvents = events.filter((event) => event.league_id === league.id);

      const computedStartDate = leagueEvents.length
        ? leagueEvents.reduce((earliest, current) =>
            new Date(current.start_date) < new Date(earliest.start_date) ? current : earliest
          ).start_date
        : null;

      return {
        ...league,
        current_participants: inscriptionMap[league.id] || 0,
        start_date: computedStartDate, 
        events: leagueEvents,
      };
    });

    res.status(200).json({ leagues: leaguesWithEvents });
  } catch (err) {
    console.error("Error al obtener ligas:", err);
    res.status(500).json({ message: "Error interno al obtener las ligas" });
  }
}

export default { getAllLeagues };