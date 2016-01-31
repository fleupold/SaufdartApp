'use strict';

class PlayerOrderEngine {
  constructor(players) {
    if (!(players instanceof Array) || players.length === 0) {
      throw new Error("Specify at least one players");
    }
    this._players = players;
    this._currentPlayerIndex = 0;
    this._scores = {};
  }

  currentPlayer() {
    return this._players[this._currentPlayerIndex];
  }

  recordThrow(number, factor) {
    var score = number * (factor || 1);
    if (!this._scores[score]) {
      this._scores[score] = [this.currentPlayer()];
    } else {
      this._scores[score] = this._scores[score].concat([this.currentPlayer()]);
    }
    this._currentPlayerIndex ++;
  }

  playerOrder() {
    var players = [];
    for (var score of Object.keys(this._scores).reverse()) {
      players = players.concat(this._scores[score]);
    }
    return players;
  }
}

module.exports = PlayerOrderEngine;