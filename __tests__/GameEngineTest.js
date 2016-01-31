/* jshint ignore:start */
'use strict';

jest.dontMock('../GameEngine');
jest.dontMock('../Player');
var GameEngine = require('../GameEngine');
var Player = require('../Player');

describe('GameEngine', function() {
  it('requires an array with at least one player', function() {
    expect(function() {new GameEngine(undefined)}).toThrow();
    expect(function() {new GameEngine(new function(){}())}).toThrow();
    expect(function() {new GameEngine([])}).toThrow();
  });
  it('knows whose turn it is', function() {
    var engine = new GameEngine([1]);
    expect(engine.currentPlayer()).toBe(1);
  });
  it('advance current player on next turn', function() {
    var engine = new GameEngine([1,2]);
    engine.nextTurn();
    expect(engine.currentPlayer()).toBe(2);
  });
  it('starts with the first player after the last', function() {
    var engine = new GameEngine([1,2]);
    engine.nextTurn();
    engine.nextTurn();
    expect(engine.currentPlayer()).toBe(1);
  });
  it('automatically advances after three throws', function() {
    var engine = new GameEngine([1,2]);
    engine.recordThrow(20, 1);
    engine.recordThrow(1, 1);
    engine.recordThrow(20, 1);
    expect(engine.currentPlayer()).toBe(2);
  });
  it('resets number of darts thrown on advance', function() {
    var engine = new GameEngine([1,2]);
    engine.recordThrow(20, 1);
    engine.nextTurn();
    expect(engine._dartsThrown).toBe(0);
  });
  it('advances a player if he hits his number', function() {
    var player = new Player("test user");
    player.target = 1;

    var engine = new GameEngine([player]);
    engine.recordThrow(1, 1);
    expect(player.target).toBe(18);
  });
  it('advances a player twice if he hits number double', function() {
    var player = new Player("test user");
    player.target = 1;

    var engine = new GameEngine([player]);
    engine.recordThrow(1, 2);
    expect(player.target).toBe(4);
  });
  it('advances a player three times if he hits his number triple', function() {
    var player = new Player("test user");
    player.target = 1;

    var engine = new GameEngine([player]);
    engine.recordThrow(1, 3);
    expect(player.target).toBe(13);
  });
  it('notices when a player has won', function() {
    var player = new Player("test user");
    player.target = 20;

    var engine = new GameEngine([player]);
    expect(engine.getWinner()).toBeNull();
    engine.recordThrow(20, 1);
    expect(engine.getWinner()).toBe(player);
  });
  it('does not call a winner early', function() {
    var player = new Player("test user");
    player.target = 5;

    var engine = new GameEngine([player]);
    engine.recordThrow(5, 1);
    expect(engine.getWinner()).toBeNull();
  });
  it('notices when a player has won by skipping last number', function() {
    var player = new Player("test user");
    player.target = 5;

    var engine = new GameEngine([player]);
    expect(engine.getWinner()).toBeNull();
    engine.recordThrow(5, 3);
    expect(engine.getWinner()).toBe(player);
  });
  it('advances other player if player hits their number', function() {
    var player1 = new Player("test user");
    player1.target = 1;

    var player2 = new Player("test user");
    player2.target = 18;
    var player3 = new Player("test user");
    player3.target = 18;

    var engine = new GameEngine([player1, player2, player3]);
    engine.recordThrow(18, 1);
    expect(player1.target).toBe(1);
    expect(player2.target).toBe(4);
    expect(player3.target).toBe(4);
  });
  it('adds up all the advances in a turn', function() {
    var player1 = new Player("test user");
    player1.target = 1;
    var player2 = new Player("test user");
    player2.target = 18;

    var engine = new GameEngine([player1, player2]);
    engine.recordThrow(1, 1); //player1 advances
    engine.recordThrow(18, 1); //player1 advances
    engine.recordThrow(18, 3); //player2 advances three times
    expect(player1.target).toBe(4);
    expect(player2.target).toBe(6);
  });
  it('does not advance other players if hits his own number', function() {
    var player1 = new Player("test user");
    player1.target = 18;
    var player2 = new Player("test user");
    player2.target = 18;

    var engine = new GameEngine([player1, player2]);
    engine.recordThrow(18, 1);
    expect(player1.target).toBe(4);
    expect(player2.target).toBe(18);
  });
  it('records that the person to the right of a score has to drink', function() {
    var player1 = new Player("test user 1");
    player1.target = 1;
    var player2 = new Player("test user 2");
    player2.target = 18;

    var engine = new GameEngine([player1, player2]);
    engine.recordThrow(1, 1);
    var drinkers = engine.getDrinkers();
    expect(drinkers[player1.name]).toBeUndefined();
    expect(drinkers[player2.name]).toBe(1);
  });
  it('adds up all the drinks in a turn', function() {
    var player1 = new Player("test user 1");
    player1.target = 1;
    var player2 = new Player("test user 2");
    player2.target = 18;

    var engine = new GameEngine([player1, player2]);
    engine.recordThrow(1, 2); //player2 has to drink two
    engine.recordThrow(18, 3); //player1 has to drink three
    var drinkers = engine.getDrinkers();
    expect(drinkers[player2.name]).toBe(2);
    expect(drinkers[player1.name]).toBe(3);
  });
  it('makes everyone but the thrower drink on does bulls eye', function() {
    var player1 = new Player("test user 1");
    var player2 = new Player("test user 2");
    var player3 = new Player("test user 3");

    var engine = new GameEngine([player1, player2, player3]);
    engine.recordThrow(50);
    var drinkers = engine.getDrinkers();
    expect(drinkers[player1.name]).toBeUndefined();
    expect(drinkers[player2.name]).toBe(1);
    expect(drinkers[player3.name]).toBe(1);
  });
  it('resets the drinks after each turn', function() {
    var player1 = new Player("test user 1");
    player1.target = 1;

    var engine = new GameEngine([player1]);
    engine.recordThrow(1, 1);
    engine.nextTurn();
    expect(Object.keys(engine.getDrinkers()).length).toBe(0);
  });
  it('calculates the color correctly', function() {
    var player1 = new Player("test user 1");
    var engine = new GameEngine([player1]);

    expect(engine._calculateColor(1,1)).toBe(3);
    expect(engine._calculateColor(1,2)).toBe(1);
    expect(engine._calculateColor(1,3)).toBe(1);

    expect(engine._calculateColor(12,1)).toBe(2);
    expect(engine._calculateColor(12,2)).toBe(0);
    expect(engine._calculateColor(12,3)).toBe(0);

    expect(engine._calculateColor(50)).toBe(0);
    expect(engine._calculateColor(25)).toBe(1);
  });
  it('swaps with left player on three times same color', function() {
    var player1 = new Player("test user 1");
    var player2 = new Player("test user 2");
    var player3 = new Player("test user 3");

    var engine = new GameEngine([player1, player2, player3]);
    engine.recordThrow(1, 1);
    engine.recordThrow(1, 1);
    engine.recordThrow(1, 1);
    expect(engine.currentPlayer()).toBe(player2);
    engine.nextTurn();
    expect(engine.currentPlayer()).toBe(player1);
    engine.nextTurn()
    expect(engine.currentPlayer()).toBe(player3);    
  });

  // Announcer logic
  it('announces the drinkers before resetting them', function() {
    var player1 = new Player("test user 1");
    player1.target = 1;

    var capturedDrinkers = {};
    var EngineListener = function() {
      this.willStartNextTurn = function (player, drinkers) {
        capturedDrinkers = drinkers;
      }
    };

    var engine = new GameEngine([player1], new EngineListener());    
    engine.recordThrow(1, 1);
    engine.nextTurn();
    expect(capturedDrinkers[player1.name]).toBe(1);
  });
  it('announces next player', function() {
    var player1 = new Player("test user 1");
    var player2 = new Player("test user 2");

    var capturedNextPlayer = {};
    var EngineListener = function() {
      this.willStartNextTurn = function (player) {
        capturedNextPlayer = player;
      }
    };

    var engine = new GameEngine([player1, player2], new EngineListener());    
    engine.nextTurn();
    expect(capturedNextPlayer).toBe(player2);
  });
  it('announces the winner', function() {
    var player1 = new Player("test user 1");
    player1.target = 20;

    var capturedWinner = {};
    var EngineListener = function() {
      this.playerDidWin = function (player) {
        capturedWinner = player;
      }
    };

    var engine = new GameEngine([player1], new EngineListener());    
    engine.recordThrow(20, 1);
    engine.nextTurn();
    expect(capturedWinner).toBe(player1);
  });
  it('announces to chose drinker on single bullseye', function() {
    var player1 = new Player("test user 1");

    var called = false;
    var EngineListener = function() {
      this.playerCanChoseDrinker = function () {
        called = true;
      }
    };

    var engine = new GameEngine([player1], new EngineListener());    
    engine.recordThrow(25);
    expect(called).toBe(true);
  });
  it('announces player exchange', function() {
    var player1 = new Player("test user 1");
    var player2 = new Player("test user 2");

    var capturedExhangers = [];
    var EngineListener = function() {
      this.willStartNextTurn = function (player, drinkers, changingPlayers) {
        capturedExhangers = changingPlayers;
      }
    };

    var engine = new GameEngine([player1, player2], new EngineListener());    
    engine.recordThrow(1,1);
    engine.recordThrow(1,1);
    engine.recordThrow(1,1);

    expect(capturedExhangers[0]).toBe(player1);
    expect(capturedExhangers[1]).toBe(player2);
  });
});