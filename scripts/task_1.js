const fs = require('fs');
const path = require('path');

let currentGame = 0;
const games = {}

const WORLD_KILL_REGEX = new RegExp(/[0-9]+:[0-9]+ Kill: [0-9]+ [0-9]+ [0-9]+: <world> killed [a-zA-Z ]+ by ([a-zA-Z]+(_[a-zA-Z]+)+)/)
const PLAYER_KILL_REGEX = new RegExp(/[0-9]+:[0-9]+ Kill: [0-9]+ [0-9]+ [0-9]+: [a-zA-Z ]+ killed [a-zA-Z ]+ by ([a-zA-Z]+(_[a-zA-Z]+)+)/)

function generateData(line) {
  const isGameStart = line.includes('InitGame:');
  const isWorldKill = WORLD_KILL_REGEX.test(line);
  const isPlayerKill = PLAYER_KILL_REGEX.test(line);

  if (!isGameStart && !isWorldKill && !isPlayerKill) return;

  if (isGameStart) {
    currentGame++;

    games[`game_${currentGame}`] = { 
      total_kills: 0, 
      players: [], 
      kills: {} 
    };

    return;
  }

  const killed = line
    .match(/killed [a-zA-Z ]+ by/gi)[0]
    .split(' ')
    .filter((_, index, killed) => index !== 0 && index !== killed.length - 1)
    .join(' ')

  const killer = isWorldKill 
    ? '<world>'
    : line
        .match(/: [a-zA-Z ]+ killed/gi)[0]
        .split(' ')
        .filter((_, index, killed) => index !== 0 && index !== killed.length - 1)
        .join(' ');

  const killedAlreadyPushedToPlayers = 
    games[`game_${currentGame}`].players.includes(killed);

  const killerAlreadyPushedToPlayers = 
    games[`game_${currentGame}`].players.includes(killer);

  const killedAlreadyPushedToKills = 
    games[`game_${currentGame}`].kills[killed] !== undefined;

  const killerAlreadyPushedToKills = 
    games[`game_${currentGame}`].kills[killer] !== undefined;

  if (!killedAlreadyPushedToPlayers) 
    games[`game_${currentGame}`].players.push(killed);

  if (!killerAlreadyPushedToPlayers && !isWorldKill) 
    games[`game_${currentGame}`].players.push(killer);

  if (!killedAlreadyPushedToKills) 
    games[`game_${currentGame}`].kills[killed] = 0;

  if (!killerAlreadyPushedToKills && !isWorldKill) 
    games[`game_${currentGame}`].kills[killer] = 0;
  
  if (!isWorldKill) games[`game_${currentGame}`].kills[killer]++;

  if (isWorldKill) 
    games[`game_${currentGame}`].kills[killed] = 
      games[`game_${currentGame}`].kills[killed] > 0 
        ? games[`game_${currentGame}`].kills[killed] - 1 
        : 0;
  

  games[`game_${currentGame}`].total_kills++;
}

const file = fs.readFileSync(
  path.resolve(__dirname, '..', 'logs', 'games.log'), 'utf8'
);

file.split('\n').forEach(line => generateData(line));

console.log(games)
