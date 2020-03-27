const _ = require('lodash')
const utils = require('./utils')
const { PathInfoBase } = require('./pathInfoBase.class')
const { PathInfoError } = require('./pathInfoError.class')

class PathInfoSync extends PathInfoBase {
  set ({ absolutePath, relRootPath }) {
    this.info = null

    const pInfo = utils.checkParameters({ absolutePath, relRootPath })
    if (!pInfo) return false

    if (utils.pathExistsSync(absolutePath) !== true) {
      throw new PathInfoError(`Main path does not exist: ${absolutePath}`)
    }

    const pStats = utils.lstatSync(absolutePath)
    if (!pStats) return false

    if (!utils.setBasicPathInfo({ pInfo, pStats, absolutePath, relRootPath })) return false
    this.info = pInfo /* needed for this.relRoot setter */

    if (_.isString(relRootPath)) this.relRoot = relRootPath
    return true
  }
}

module.exports = {
  PathInfoSync
}
