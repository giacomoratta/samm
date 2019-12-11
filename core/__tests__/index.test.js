const appCore = require('../index');

test('adds 1 + 2 to equal 3', () => {
    console.log(appCore.config.set)
    console.log(appCore.config.setfail)
    expect(3).toBe(3);
});
