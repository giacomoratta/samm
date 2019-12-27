const _ = require('../../core/utils/lodash.extended')
const path = require('path')
const fileUtils = require('../../core/utils/file.utils')
const stringUtils = require('../../core/utils/string.utils')

class PathInfo {
  constructor (initData) {
    this.info = {}

    if (_.isString(initData)) {
      if (!fileUtils.isAbsolutePath(initData)) {
        throw new Error(`PathInfo - ${initData} is not an absolute path`)
      }
      const absPath = initData
      const pInfo = path.parse(absPath)
      if (!pInfo) {
        throw new Error(`PathInfo - error while parsing ${absPath}`)
      }
      const stats = fileUtils.getPathStatsSync(absPath)
      if (!stats) {
        throw new Error(`PathInfo - error while getting path stats of ${absPath}`)
      }

      this.info = pInfo
      if (this.info.ext.startsWith('.')) this.info.ext = this.info.ext.slice(1)
      this.info.path = absPath
      this.info.level = 1
      this.info.size = (stats.size ? stats.size : 0)
      this.info.createdAt = stats.birthtime
      this.info.modifiedAt = stats.mtime
      this.info.isFile = stats.isFile()
      this.info.isDirectory = stats.isDirectory()
    } else if (_.isObject(initData) && initData.constructor.name === 'PathInfo') {
      this.info = _.cloneDeep(initData.info)
    } else if (!_.isNil(initData)) {
      throw new Error(`Invalid initData: ${initData}`)
    }
  }

  isEqualTo (obj2) {
    return (
      (this.info.path === obj2.info.path) &&
            (this.info.root === obj2.info.root) &&
            (this.info.dir === obj2.info.dir) &&
            (this.info.base === obj2.info.base) &&
            (this.info.ext === obj2.info.ext) &&
            (this.info.name === obj2.info.name) &&
            (this.info.level === obj2.info.level) &&
            (this.info.relRoot === obj2.info.relRoot) &&
            (this.info.relPath === obj2.info.relPath) &&
            (this.info.size === obj2.info.size) &&
            (this.info.isFile === obj2.info.isFile) &&
            (this.info.isDirectory === obj2.info.isDirectory)
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
  get sizeString () { return stringUtils.fileSizeToStr(this.info.size) }

  /* Setters */
  set size (size) { this.info.size = size }
  set relRoot (root) {
    this.info.relRoot = root
    this.info.relPath = this.info.path.substring(this.info.relRoot.length + 1)
    // if (this.info.relPath.length === 0) this.info.relPath = path.sep
    // if (this.info.relPath.endsWith(path.sep)) this.info.relPath = this.info.relPath.substr(0, this.info.relPath.length - 2) // remove final path.sep
    if (this.info.relPath.length > 0) this.info.level = _.split(this.info.relPath, path.sep).length + 1
  }

  toJson () {
    return _.cloneDeep(this.info)
  }

  fromJson (data) {
    this.info = _.cloneDeep(data)
  }
}

module.exports = PathInfo
