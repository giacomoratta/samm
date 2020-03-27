const _ = require('lodash')
const utils = require('./utils')
const { PathInfoBase } = require('./pathInfoBase.class')
const { PathInfoError } = require('./pathInfoError.class')

class PathInfo extends PathInfoBase {
  async set ({ absolutePath, relRootPath }) {
    this.info = null

    const pInfo = utils.checkParameters({ absolutePath, relRootPath })
    if (!pInfo) return false

    if (await utils.pathExists(absolutePath) !== true) {
      throw new PathInfoError(`Main path does not exist: ${absolutePath}`)
    }

    const pStats = await utils.lstat(absolutePath)
    if (!pStats) return false

    if (!utils.setBasicPathInfo({ pInfo, pStats, absolutePath })) return false
    this.info = pInfo /* needed for this.relRoot setter */

    if (_.isString(relRootPath)) this.relRoot = relRootPath
    return true
  }
}

module.exports = {
  PathInfo
}
