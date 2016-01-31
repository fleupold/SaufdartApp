/* jshint ignore:start */
'use strict';

jest.dontMock('../PlayerOrderEngine');
var PlayerOrderEngine = require('../PlayerOrderEngine');

describe('PlayerOrderEngine', function() {
  it('requires a list of names', function() {
    expect(function() {new PlayerOrderEngine(undefined)}).toThrow();
    expect(function() {new PlayerOrderEngine(new function(){}())}).toThrow();
    expect(function() {new PlayerOrderEngine([])}).toThrow();
  });
  it('knows whose turn it is', function() {
    var engine = new PlayerOrderEngine([1]);
    expect(engine.currentPlayer()).toBe(1);
  });
  it('advances current player on each throw', function() {
    var engine = new PlayerOrderEngine([1, 2]);
    engine.recordThrow(1,1);
    expect(engine.currentPlayer()).toBe(2);
  });
  it('returns undefined after every player has thrown', function() {
    var engine = new PlayerOrderEngine([1, 2]);
    engine.recordThrow(1,1);
    engine.recordThrow(1,1);
    expect(engine.currentPlayer()).toBeUndefined();
  });
  it('orders players based on their scores', function() {
    var engine = new PlayerOrderEngine([1, 2, 3]);
    engine.recordThrow(20,1);
    engine.recordThrow(20,2);
    engine.recordThrow(15,2);

    expect(engine.playerOrder()[0]).toBe(2);
    expect(engine.playerOrder()[1]).toBe(3);
    expect(engine.playerOrder()[2]).toBe(1);
  });
  it('resolves ties per by order', function() {
    var engine = new PlayerOrderEngine([1, 2, 3]);
    engine.recordThrow(10,1);
    engine.recordThrow(11,1);
    engine.recordThrow(10,1);

    expect(engine.playerOrder()[0]).toBe(2);
    expect(engine.playerOrder()[1]).toBe(1);
    expect(engine.playerOrder()[2]).toBe(3);
  });
});