const _ = require('../utils/lodash.extended')
const { parseOption } = require('./fileButler.utils')
const FileButlerError = require('./fileButlerError.class')
const Events = require('events')
const fileUtils = require('../utils/file.utils')

const ACCEPTED_EVENTS = ['change']

// todo: replace custom function with events (check event finished and get returned data)

class FileButler {
  constructor (options) {
    this.eventEmitter = new Events()
    this.config = parseOption(options)
    this.data = this.config.defaultValue
    this.load()
  }

  get () {
    return this.data
  }

  set (data) {
    if (this.config.fn.validityCheck(data) !== true) return false
    this.data = data
    this.eventEmitter.emit('set', { data: this.data })
    return true
  }

  save () {
    let savedData = this.data
    if(this.config.saveFn) savedData = this.config.saveFn(this.data)
    const saveResult = this.config.fn.saveToFile(this.config.filePath, savedData)
    if(saveResult === true) {
      this.eventEmitter.emit('save', { filePath: this.config.filePath, data: savedData })
    }
    if(this.config.backupTo) {
      const copyResult = fileUtils.copyFileSync(this.config.filePath,this.config.backupTo)
      if(copyResult.err) {
        throw new FileButlerError(`Backup failed! From '${this.config.backupTo}' to ${this.config.backupTo}`)
      }
    }
    return saveResult
  }

  load () {
    if(this.config.cloneFrom && !fileUtils.fileExistsSync(this.config.filePath)) {
      const copyResult = fileUtils.copyFileSync(this.config.cloneFrom,this.config.filePath)
      if(copyResult.err) {
        throw new FileButlerError(`Cloning failed! From '${this.config.cloneFrom}' to ${this.config.filePath}`)
      }
    }
    let loadedData = this.config.fn.loadFromFile(this.config.filePath)
    if(this.config.loadFn) loadedData = this.config.loadFn(loadedData)
    if (_.isNil(loadedData)) loadedData = this.config.defaultValue
    this.data = loadedData
    this.eventEmitter.emit('load', { filePath: this.config.filePath, data: loadedData })
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new FileButlerError(`Unrecognized event '${eventName}' for ${this.constructor.name}`)
    }
    this.eventEmitter.on(eventName, cb)
  }
}

module.exports = FileButler
