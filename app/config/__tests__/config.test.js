const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('../../../core/utils/file.utils')

describe('config endpoints', function () {
  beforeEach(() => {
    // fileUtils.removeDirSync(path.join(process.env.ABSOLUTE_APP_PATH, 'userdata'))
    // fileUtils.removeFileSync(path.join(process.env.ABSOLUTE_APP_PATH, 'config.json'))
  })

  it('should create and handle the main app config file', function () {
    const { Config } = require('../index')
  })
})
