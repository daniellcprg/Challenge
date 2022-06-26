const fs = require('fs');
const path = require('path');

class LogParser {
  constructor() {
    this.games = {};
    this.currentGame = 0;
  }

  execute() {
    const file = fs.readFileSync(
      path.resolve(__dirname, 'logs', 'games.log'), 'utf8'
    );

    file.split('\n').forEach(line => this.generateData(line));

    return this.games;
  }

  generateData(line) {
    const WORLD_KILL_REGEX = new RegExp(/[0-9]+:[0-9]+ Kill: [0-9]+ [0-9]+ [0-9]+: <world> killed [a-zA-Z ]+ by ([a-zA-Z]+(_[a-zA-Z]+)+)/)
    const PLAYER_KILL_REGEX = new RegExp(/[0-9]+:[0-9]+ Kill: [0-9]+ [0-9]+ [0-9]+: [a-zA-Z ]+ killed [a-zA-Z ]+ by ([a-zA-Z]+(_[a-zA-Z]+)+)/)

    const isGameStart = line.includes('InitGame:');
    const isWorldKill = WORLD_KILL_REGEX.test(line);
    const isPlayerKill = PLAYER_KILL_REGEX.test(line);
  
    if (!isGameStart && !isWorldKill && !isPlayerKill) return;
  
    if (isGameStart) {
      this.currentGame++;
  
      this.games[`game_${this.currentGame}`] = { 
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
      this.games[`game_${this.currentGame}`].general_ranking[killed] !== undefined;
  
    const killerAlreadyPushedToGeneralRanking = 
      this.games[`game_${this.currentGame}`].general_ranking[killer] !== undefined;
  
    if (!killedAlreadyPushedToGeneralRanking) 
      this.games[`game_${this.currentGame}`].general_ranking[killed] = 0;
  
    if (!killerAlreadyPushedToGeneralRanking && !isWorldKill) 
      this.games[`game_${this.currentGame}`].general_ranking[killer] = 0;
  
    if (!isWorldKill) this.games[`game_${this.currentGame}`].general_ranking[killer]++;
  
    if (isWorldKill) {
      this.games[`game_${this.currentGame}`].general_ranking[killed] = 
        this.games[`game_${this.currentGame}`].general_ranking[killed] > 0 
          ? this.games[`game_${this.currentGame}`].general_ranking[killed] - 1 
          : 0;
  
      this.games[`game_${this.currentGame}`].killed_by_world[killed] = 
        this.games[`game_${this.currentGame}`].killed_by_world[killed]
          ? this.games[`game_${this.currentGame}`].killed_by_world[killed] + 1
          : 1;
    }
  
    this.games[`game_${this.currentGame}`].kills_by_means[kill_meaning] = 
      this.games[`game_${this.currentGame}`].kills_by_means[kill_meaning]
        ? this.games[`game_${this.currentGame}`].kills_by_means[kill_meaning] + 1
        : 1;
  }
}

module.exports = LogParser;