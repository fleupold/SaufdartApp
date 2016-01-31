'use strict';

var kDartsPerTurn = 3;
var kDartBoardLayout = [1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 20];

var ColorEnum = Object.freeze({RED: 0, GREEN: 1, BLACK: 2, WHITE: 3});

class GameEngine {
  constructor(players, listener) {
    if (!(players instanceof Array) || players.length === 0) {
      throw new Error("Specify at least one player");
    }
    this._players = players;
    this._currentPlayerIndex = 0;
    this._dartsThrown = 0;
    this._winner = null;
    this._drinkers = {};
    this._tShirtChangePossible = true;
    this._tShirtChangeColor = null;
    this._playersChanged = null;
    this._listener = listener;
  }

  currentPlayer() {
    return this._players[this._currentPlayerIndex];
  }

  getWinner() {
    return this._winner;
  }

  getDrinkers() {
    return this._drinkers;
  }

  addDrinker(player, numberOfDrinks) {
    var currentDrinks = this._drinkers[player.name] || 0;
    this._drinkers[player.name] = currentDrinks + numberOfDrinks;
  }

  nextTurn() {
    if (this._listener && this._listener.willStartNextTurn) {
      this._listener.willStartNextTurn(
        this._nextPlayer(), this._drinkers, this._playersChanged);      
    }

    this._dartsThrown = 0;
    this._drinkers = {};
    this._tShirtChangePossible = true;
    this._tShirtChangeColor = null;
    this._playersChanged = null;
    this._currentPlayerIndex = this._players.indexOf(this._nextPlayer());
  }

  recordThrow(number, factor) {
    var currentPlayer = this.currentPlayer();
    if (currentPlayer.target === number) {
      this._advance(currentPlayer, factor);
    } else if (number === 50) {
      // everyone except the current player has to drink
      for (var player of this._players) {
        if (player === currentPlayer) {
          continue;
        }
        this.addDrinker(player, 1);
      }
    } else if (number === 25) {
      // single bullseye chose drinker
      if (this._listener && this._listener.playerCanChoseDrinker) {
        this._listener.playerCanChoseDrinker();
      }
    } else {
      // check if throw helped others
      for (var player of this._players) {
        if (player.target === number) {
          this._advance(player, factor);
        }
      }
    }
    this._checkForTshirtChange(this._calculateColor(number, factor));
    // check for end of round
    this._dartsThrown += 1;
    if (this._dartsThrown === kDartsPerTurn) {
      if (this._tShirtChangePossible) {
        this._switchWithPreviousPlayer();
      }
      this.nextTurn();
    }
  }

  _checkForTshirtChange(color) {
    if (!this._tShirtChangePossible) {
      return;
    }
    if (this._tShirtChangeColor === null) {
      this._tShirtChangeColor = color;
    } else if (this._tShirtChangeColor !== color) {
      this._tShirtChangePossible = false;
    }
  }

  _calculateColor(number, factor) {
    if (number === 25) {
      return ColorEnum.GREEN;
    } else if (number === 50) {
      return ColorEnum.RED;
    }

    var indexOnBoard = kDartBoardLayout.indexOf(number);
    if (indexOnBoard % 2) {
      if (factor > 1) {
        return ColorEnum.RED;
      } else {
        return ColorEnum.BLACK;
      }
    } else {
      if (factor > 1) {
        return ColorEnum.GREEN;
      } else {
        return ColorEnum.WHITE;
      }
    }
  }

  _advance(player, factor) {
    var previousTargetIndexOnBoard = kDartBoardLayout.indexOf(player.target);
    var newTargetIndexOnBoard = previousTargetIndexOnBoard + factor;
    if (newTargetIndexOnBoard >= 20) {
      this._winner = player;
      if (this._listener && this._listener.playerDidWin) {
        this._listener.playerDidWin(player);
      }
    } else {
      player.target = kDartBoardLayout[newTargetIndexOnBoard];        
    }
    this.addDrinker(this._nextPlayer(player), factor);
  }

  _nextPlayer(currentPlayer) {
    if (!currentPlayer) {
      currentPlayer = this.currentPlayer();
    }
    var index = this._players.indexOf(currentPlayer);
    return this._players[(index + 1) % this._players.length];
  }

  _previousPlayer() {
    var previousPlayerIndex = (this._currentPlayerIndex + this._players.length - 1) % this._players.length;
    return this._players[previousPlayerIndex];
  }

  _switchWithPreviousPlayer() {
    if (this._players.length < 2) {
      return;
    }

    var previousPlayer = this._previousPlayer();
    var previousPlayerIndex = this._players.indexOf(previousPlayer);
    var temp = this._players[this._currentPlayerIndex];
    this._players[this._currentPlayerIndex] = previousPlayer;
    this._players[previousPlayerIndex] = temp;

    this._playersChanged = [temp, previousPlayer];
  }
}

module.exports = GameEngine;