const path = require('path')
const fsExtra = require('fs-extra')
const childProcess = require('child_process')
const stream = require('stream')
const pino = require('pino')
const pinoTeeReq = require.resolve('pino-tee')

class FileLogger {
  constructor ({ logsDirPath, minLevel = 10 }) {
  }

  _init ({ minLevel }) {
  }

  _generateFileName () {
  }

  child ({ module }) {
  }

  kill () {
  }
}

module.exports = {
  FileLogger
}
