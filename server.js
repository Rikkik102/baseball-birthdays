const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const playersPath = path.join(__dirname, 'data', 'players.json');
let players = [];


try {
  const data = fs.readFileSync(playersPath, 'utf-8');
  players = JSON.parse(data);
  console.log(`Loaded ${players.length} players from cache.`);
} catch (err) {
  console.error('Error loading players:', err);
}

app.get('/', (req, res) => {
  const inputMonth = req.query.month;
  const inputDay = req.query.day?.padStart(2, '0');

  let matchingPlayers = [];
  let displayDate = null;

  if (inputMonth && inputDay) {
    matchingPlayers = players.filter(player => {
      if (!player.birthDate) return false;
      const [_, pMonth, pDay] = player.birthDate.split('-');
      return pMonth === inputMonth && pDay === inputDay;
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(inputMonth, 10) - 1;
    const monthName = monthNames[monthIndex];
    displayDate = `${monthName} ${parseInt(inputDay, 10)}`;
  }

  res.render('index', {
    players: matchingPlayers,
    displayDate
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
