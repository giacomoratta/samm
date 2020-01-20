const path = require('path')
const _ = require('lodash')
const utils = require('./utils')
const { PathInfoBase } = require('./pathInfoBase.class')

class PathInfoSync extends PathInfoBase {
  constructor () {
    super()
  }

  set ({ absolutePath, relRootPath }) {
    this.info = null
    const pInfo = utils.checkParameters({ absolutePath, relRootPath })
    if(!pInfo) return false
    const pStats = utils.lstatSync(absolutePath)
    if(!pStats) return false
    if(!utils.setBasicPathInfo({ pInfo, pStats, absolutePath, relRootPath })) return false
    this.info = pInfo
    if(relRootPath) this.relRoot = relRootPath
    return true
  }
}

module.exports = {
  PathInfoSync
}
