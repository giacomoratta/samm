require('../globals.js');
global.assert = require('assert');

describe('libs', () => {
    require('./libs/testA.js');
});

describe('modules', () => {
    require('./modules/testB.js');
});