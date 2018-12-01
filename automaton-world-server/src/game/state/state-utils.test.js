const {getRandomIntegerInRange, getRowAndColumnFromIndex, getIndexFromRowAndColumn, getRelativeIndex, getFilledIndices, getEmptyIndices, getUnoccupiedSlot, getNeighbourCellValues} = require('./state-utils');


describe('state-utils', () => {
  // grid for positional tests on non-empty grid:
  // ┌───┬───┬───┬───┬───┐
  // │   │   │   │   │   │
  // ├───┼───┼───┼───┼───┤
  // │   │ p │   │ o │   │
  // ├───┼───┼───┼───┼───┤
  // │ o │   │   │   │ o │
  // ├───┼───┼───┼───┼───┤
  // │   │ a │ t │ p │   │
  // └───┴───┴───┴───┴───┘

  const grid_4x5 = new Array(25);
  grid_4x5[6] = {type: 'player'};
  grid_4x5[8] = {type: 'object'};
  grid_4x5[10] = {type: 'object'};
  grid_4x5[14] = {type: 'object'};
  grid_4x5[16] = {type: 'asset'};
  grid_4x5[17] = {type: 'target'};
  grid_4x5[18] = {type: 'player'};
  const grid_4x5_cols = 5;
  const grid_4x5_filledIndices = [6, 8, 10, 14, 16, 17, 18];
  const grid_4x5_emptyIndices = [0, 1, 2, 3, 4, 5, 7, 9, 11, 12, 13, 15, 19, 20, 21, 22, 23, 24];

  describe('getRandomIntegerInRange', () => {
    test('result is integer', () => {
      const result = getRandomIntegerInRange(0, 10);
      expect(result - Math.floor(result)).toBe(0);
    });
    test('result is in provided range', () => {
      const min = 5, max = 10, testCount = (max - min) * 100;
      for (let i = 0; i < testCount; i++) {
        let randomInt = getRandomIntegerInRange(min, max);
        expect(randomInt).toBeGreaterThanOrEqual(min);
        expect(randomInt).toBeLessThanOrEqual(max);
      }
    });
    test('result of zero-width range is correct', () => {
      const testInt = 5;
      expect(getRandomIntegerInRange(testInt, testInt)).toBe(testInt);
    });
    test('result of reversed range is correct', () => {
      const min = 5, max = 10;
      let randomInt = getRandomIntegerInRange(max, min);
      expect(randomInt).toBeGreaterThanOrEqual(min);
      expect(randomInt).toBeLessThanOrEqual(max);
    });
  });

  describe('getRowAndColumnFromIndex', () => {
    test('returns correct values, basic case', () => {
      expect(getRowAndColumnFromIndex(grid_4x5_cols, 13)).toEqual({row: 2, col: 3});
    });
  });

  describe('getIndexFromRowAndColumn', () => {
    test('returns correct values, basic case', () => {
      expect(getIndexFromRowAndColumn(grid_4x5_cols, 2, 3)).toEqual(13);
    });
  });

  describe('getRelativeIndex', () => {
    test('check results of move in cardinal direction', () => {
      expect(getRelativeIndex(7, 4, grid_4x5_cols, 'up')).toBe(2);
      expect(getRelativeIndex(7, 4, grid_4x5_cols, 'right')).toBe(8);
      expect(getRelativeIndex(7, 4, grid_4x5_cols, 'down')).toBe(12);
      expect(getRelativeIndex(7, 4, grid_4x5_cols, 'left')).toBe(6);
      expect(getRelativeIndex(7, 4, grid_4x5_cols, 'foobar')).toBe(7);
    });
  });

  describe('getFilledIndices', () => {
    test('check for length and contents of returned array', () => {
      expect(getFilledIndices(grid_4x5)).toEqual(grid_4x5_filledIndices);
    })
  });

  describe('getEmptyIndices', () => {
    test('check for length and contents of returned array', () => {
      expect(getEmptyIndices(grid_4x5)).toEqual(grid_4x5_emptyIndices);
    })
  });

  describe('getUnoccupiedSlot', () => {
    test('check that result is not an occupied index', () => {
      const testSlotIndex = getUnoccupiedSlot(grid_4x5);
      expect(grid_4x5_filledIndices.some(elem => elem === testSlotIndex)).toBe(false);
    })
  });

  describe('getNeighbourCellValues', () => {
    test('neighbour cell values on an empty 3x3 grid', () => {
      const sparseArray = new Array(9);
      const cols = 3;
      // first row
      expect(getNeighbourCellValues(sparseArray, cols, 0))
        .toEqual({up: {type: 'edge'}, right: null, down: null, left: {type: 'edge'}});
      expect(getNeighbourCellValues(sparseArray, cols, 1))
        .toEqual({up: {type: 'edge'}, right: null, down: null, left: null});
      expect(getNeighbourCellValues(sparseArray, cols, 2))
        .toEqual({up: {type: 'edge'}, right: {type: 'edge'}, down: null, left: null});
      // second row
      expect(getNeighbourCellValues(sparseArray, cols, 3))
        .toEqual({up: null, right: null, down: null, left: {type: 'edge'}});
      expect(getNeighbourCellValues(sparseArray, cols, 4))
        .toEqual({up: null, right: null, down: null, left: null});
      expect(getNeighbourCellValues(sparseArray, cols, 5))
        .toEqual({up: null, right: {type: 'edge'}, down: null, left: null});
      // // third row
      expect(getNeighbourCellValues(sparseArray, cols, 6))
        .toEqual({up: null, right: null, down: {type: 'edge'}, left: {type: 'edge'}});
      expect(getNeighbourCellValues(sparseArray, cols, 7))
        .toEqual({up: null, right: null, down: {type: 'edge'}, left: null});
      expect(getNeighbourCellValues(sparseArray, cols, 8))
        .toEqual({up: null, right: {type: 'edge'}, down: {type: 'edge'}, left: null});
    });


    test('check contents of cells at cardinal points', () => {
      const boundaryObject = {type: 'border'};
      expect(getNeighbourCellValues(grid_4x5, grid_4x5_cols, 3, boundaryObject))
        .toEqual({up: boundaryObject, right: null, down: {type: 'object'}, left: null});
      expect(getNeighbourCellValues(grid_4x5, grid_4x5_cols, 7, boundaryObject))
        .toEqual({up: null, right: {type: 'object'}, down: null, left: {type: 'player'}});
      expect(getNeighbourCellValues(grid_4x5, grid_4x5_cols, 11, boundaryObject))
        .toEqual({
          up: {type: 'player'},
          right: null,
          down: {type: 'asset'},
          left: {type: 'object'}
        });
    });

  });
});
