jest.mock('../src/logger.js');
jest.mock('axios');

const logger = require('../src/logger.js');
const axios = require('axios');
const inquirer = require('inquirer');
const index = require('../src/index');


describe('main program - index.js', () => {
  jest.mock('inquirer');
  // TODO: write some tests for the index module, if necessary
  //   so far, everything I've tried has turned out to actually be tests of the inquirer module
  test('stub', () => {
    expect(1+1).toBe(2);
  })
})
