'use strict';

var kFirstTarget = 1;

class Player {
  constructor(name) {
    this.name = name;
    this.target = kFirstTarget;
  }
}

module.exports = Player;