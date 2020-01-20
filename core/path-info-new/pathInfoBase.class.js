const path = require('path')
const _ = require('lodash')
const utils = require('./utils')

class PathInfoBase {
  constructor () {
    this.info = null
  }

  isSet () {
    return _.isObject(this.info)
  }

  setSync ({ absolutePath, relRootPath }) {
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

  async set ({ absolutePath, relRootPath }) {
    this.info = null
    const pInfo = utils.checkParameters({ absolutePath, relRootPath })
    if(!pInfo) return false
    const pStats = await utils.lstat(absolutePath)
    if(!pStats) return false
    if(!utils.setBasicPathInfo({ pInfo, pStats, absolutePath })) return false
    this.info = pInfo
    if(relRootPath) this.relRoot = relRootPath
    return true
  }

  isEqualTo (obj) {
    return (
      this.info.path === obj.info.path &&
      this.info.root === obj.info.root &&
      // && this.info.dir === obj.info.dir
      // && this.info.base === obj.info.base
      // && this.info.ext === obj.info.ext
      // && this.info.name === obj.info.name
      // && this.info.level === obj.info.level
      this.info.relRoot === obj.info.relRoot &&
      this.info.relPath === obj.info.relPath
      // && this.info.size === obj.info.size
      // && this.info.isFile === obj.info.isFile
      // && this.info.isDirectory === obj.info.isDirectory
    )
  }

  /* Getters */

  get root () { return this.info.root }
  get dir () { return this.info.dir }
  get base () { return this.info.base }
  get ext () { return this.info.ext }
  get name () { return this.info.name }
  get path () { return this.info.path }
  get createdAt () { return this.info.createdAt }
  get modifiedAt () { return this.info.modifiedAt }
  get size () { return this.info.size }
  get isFile () { return this.info.isFile }
  get isDirectory () { return this.info.isDirectory }
  get relRoot () { return this.info.relRoot }
  get relPath () { return this.info.relPath }
  get level () { return this.info.level }
  get sizeString () { return utils.fileSizeToStr(this.info.size) }

  /* Setters */

  set size (size) { this.info.size = size }

  set relRoot (root) {
    this.info.relRoot = root
    this.info.relPath = this.info.path.substring(this.info.relRoot.length + 1)
    // if (this.info.relPath.length === 0) this.info.relPath = path.sep
    // if (this.info.relPath.endsWith(path.sep)) this.info.relPath = this.info.relPath.substr(0, this.info.relPath.length - 2) // remove final path.sep
    if (this.info.relPath.length > 0) this.info.level = this.info.relPath.split(path.sep).length + 1
  }

  clone () {
    const newPathInfo = new this.constructor()
    newPathInfo.info = _.cloneDeep(this.info)
    return newPathInfo
  }

  toJson () {
    return _.cloneDeep(this.info)
  }

  fromJson (data) {
    this.info = _.cloneDeep(data)
  }
}

module.exports = {
  PathInfoBase
}
