const path = require('path')
const { SequoiaPath } = require('../index')

const TestTempDirectory = path.join(__dirname, 'test_dir')

/* These 2 directories have the same files inside */
const TestDirD2 = path.join(__dirname, 'test_dir', 'directory1', 'directory2')
const TestDirT2 = path.join(__dirname, 'test_temp', 'directory2')

/* Main SequoiaPath object */
let sq = null

describe('SequoiaPath object', function () {
  beforeAll(async function () {
    sq = new SequoiaPath(TestTempDirectory)
    await expect(sq.read()).resolves.toEqual(true)
  })

  // afterAll(function () {})

  it('should have a correct tree after reading simple directory', async function () {

  })

  it('should match two equal trees', async function () {

  })

  it('should not match two different trees', async function () {

  })

  it('should loop on a tree', async function () {

  })

  it('should walk in a tree', async function () {

  })
})
