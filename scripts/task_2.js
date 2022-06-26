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
      kills_by_means: {}, 
      general_ranking: {}, 
      killed_by_world: {} 
    };

    return;
  }

  const kill_meaning = line.split(' ').pop();

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

  const killedAlreadyPushedToGeneralRanking = 
    games[`game_${currentGame}`].general_ranking[killed] !== undefined;

  const killerAlreadyPushedToGeneralRanking = 
    games[`game_${currentGame}`].general_ranking[killer] !== undefined;

  if (!killedAlreadyPushedToGeneralRanking) 
    games[`game_${currentGame}`].general_ranking[killed] = 0;

  if (!killerAlreadyPushedToGeneralRanking && !isWorldKill) 
    games[`game_${currentGame}`].general_ranking[killer] = 0;

  if (!isWorldKill) games[`game_${currentGame}`].general_ranking[killer]++;

  if (isWorldKill) {
    games[`game_${currentGame}`].general_ranking[killed] = 
      games[`game_${currentGame}`].general_ranking[killed] > 0 
        ? games[`game_${currentGame}`].general_ranking[killed] - 1 
        : 0;

    games[`game_${currentGame}`].killed_by_world[killed] = 
      games[`game_${currentGame}`].killed_by_world[killed]
        ? games[`game_${currentGame}`].killed_by_world[killed] + 1
        : 1;
  }

  games[`game_${currentGame}`].kills_by_means[kill_meaning] = 
    games[`game_${currentGame}`].kills_by_means[kill_meaning]
      ? games[`game_${currentGame}`].kills_by_means[kill_meaning] + 1
      : 1;
}

const file = fs.readFileSync(
  path.resolve(__dirname, '..', 'logs', 'games.log'), 'utf8', 'utf8'
);

file.split('\n').forEach(line => generateData(line));

console.log(games)
