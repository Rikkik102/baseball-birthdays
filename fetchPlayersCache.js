const axios = require('axios');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllPlayers() {
  try {
    const teamResponse = await axios.get('https://statsapi.mlb.com/api/v1/teams?sportId=1');
    const teams = teamResponse.data.teams;

    const allPlayers = [];

    for (const team of teams) {
      const teamId = team.id;
      const teamName = team.name;

      try {
        const rosterResponse = await axios.get(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`);
        const roster = rosterResponse.data.roster;

        for (const player of roster) {
          const playerId = player.person.id;

          // Throttle here to prevent spamming the API
          await sleep(300); // Wait 300ms between player requests

          try {
            const playerDetailResp = await axios.get(`https://statsapi.mlb.com/api/v1/people/${playerId}`);
            const playerData = playerDetailResp.data.people[0];

            allPlayers.push({
              id: playerData.id,
              fullName: playerData.fullName,
              birthDate: playerData.birthDate,
              team: teamName
            });

            console.log(`Added ${playerData.fullName} (${teamName})`);
          } catch (playerErr) {
            console.warn(`Could not fetch details for player ID ${playerId}: ${playerErr.message}`);
          }
        }
      } catch (teamErr) {
        console.warn(`Failed to get roster for ${teamName}: ${teamErr.message}`);
      }
    }

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(allPlayers, null, 2));

    console.log(`\n✅ Saved ${allPlayers.length} players to data/players.json`);
  } catch (err) {
    console.error('🚨 Error fetching teams:', err.message);
  }
}

fetchAllPlayers();
